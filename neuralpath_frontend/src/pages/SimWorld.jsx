import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { runPython, loadPyodideOnce } from '../lib/pyodide'
import toast from 'react-hot-toast'

export default function SimWorld() {
  const [datasets, setDatasets] = useState([])
  const [selected, setSelected] = useState(null)
  const [dataset, setDataset] = useState(null)
  const [features, setFeatures] = useState([])
  const [results, setResults] = useState(null)
  const [explanation, setExplanation] = useState('')
  const [pyReady, setPyReady] = useState(false)
  const [pyLoading, setPyLoading] = useState(false)
  const [running, setRunning] = useState(false)
  const [explaining, setExplaining] = useState(false)
  const [loadingDs, setLoadingDs] = useState(false)

  useEffect(() => {
    api.getDatasets().then(setDatasets).catch(console.error)
    setPyLoading(true)
    loadPyodideOnce(msg => console.log(msg))
      .then(() => { setPyReady(true); setPyLoading(false) })
      .catch(() => setPyLoading(false))
  }, [])

  const handleSelectDataset = async (name) => {
    setSelected(name); setResults(null); setFeatures([]); setExplanation('')
    setLoadingDs(true)
    try {
      const ds = await api.getDataset(name)
      setDataset(ds)
      setFeatures(ds.feature_columns?.slice(0, 3) || [])
    } catch (e) { toast.error(e.message) }
    finally { setLoadingDs(false) }
  }

  const handleRunModel = async () => {
    if (!dataset || features.length < 1 || !pyReady) return
    setRunning(true); setResults(null)
    try {
      const rows = dataset.rows
      const target = dataset.target_column
      const taskType = dataset.task_type

      const code = `
import json, numpy as np
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, mean_absolute_error

rows = ${JSON.stringify(rows)}
features = ${JSON.stringify(features)}
target = "${target}"
task_type = "${taskType}"

import pandas as pd
df = pd.DataFrame(rows)

# Encode string columns
for col in df.columns:
    if df[col].dtype == object:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))

X = df[features].fillna(0)
y = df[target].fillna(0)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

if task_type == 'classification':
    model = LogisticRegression(max_iter=500)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    score = accuracy_score(y_test, y_pred)
    sample_pred = str(model.predict(X_test[:1])[0])
    sample_features = dict(zip(features, X_test.iloc[0].tolist()))
    result = {"metric": "Accuracy", "value": round(float(score)*100, 1), "sample_prediction": sample_pred, "sample_features": sample_features, "n_train": len(X_train), "n_test": len(X_test)}
else:
    model = LinearRegression()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    score = mean_absolute_error(y_test, y_pred)
    sample_pred = str(round(model.predict(X_test[:1])[0], 3))
    sample_features = dict(zip(features, X_test.iloc[0].tolist()))
    result = {"metric": "MAE", "value": round(float(score), 4), "sample_prediction": sample_pred, "sample_features": sample_features, "n_train": len(X_train), "n_test": len(X_test)}

import json; print(json.dumps(result))
`
      const { output, error } = await runPython(code)
      if (error) throw new Error(error)
      const parsed = JSON.parse(output.trim())
      setResults(parsed)
    } catch (e) { toast.error(`Model error: ${e.message}`) }
    finally { setRunning(false) }
  }

  const handleExplain = async () => {
    if (!results || explaining) return
    setExplaining(true)
    try {
      const data = await api.explainPrediction(dataset.name, results.sample_prediction, results.sample_features)
      setExplanation(data.explanation)
    } catch (e) { toast.error(e.message) }
    finally { setExplaining(false) }
  }

  const toggleFeature = (col) => {
    setFeatures(f => f.includes(col) ? f.filter(c => c !== col) : [...f, col])
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-neural-text">Sim World</h1>
        <p className="text-neural-muted mt-1">Train real ML models on real datasets — entirely in your browser</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dataset selector */}
        <div className="lg:col-span-1 space-y-3">
          <div className="section-title">Choose Dataset</div>
          {datasets.map(ds => (
            <button key={ds.name} onClick={() => handleSelectDataset(ds.name)}
              className={`w-full card-hover text-left ${selected === ds.name ? 'border-neural-accent/60 bg-neural-accent/5' : ''}`}>
              <div className="font-heading font-semibold text-neural-text text-sm mb-1">{ds.display_name}</div>
              <p className="text-neural-muted text-xs line-clamp-2 mb-2">{ds.description}</p>
              <div className="flex gap-2">
                <span className="badge-accent text-[10px]">{ds.task_type}</span>
                <span className="text-neural-muted text-[10px]">{ds.row_count} rows</span>
              </div>
            </button>
          ))}

          {/* Python status */}
          <div className={`card text-center text-xs ${pyReady ? 'border-neural-success/30' : 'border-neural-xp/30'}`}>
            <span className={pyReady ? 'text-neural-success' : 'text-neural-xp'}>
              {pyReady ? '✓ Pyodide ready' : pyLoading ? '⏳ Loading Python...' : '⚠ Python not loaded'}
            </span>
          </div>
        </div>

        {/* Dataset explorer + model builder */}
        <div className="lg:col-span-2 space-y-4">
          {loadingDs && <div className="card flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-neural-accent border-t-transparent rounded-full animate-spin" /></div>}

          {dataset && !loadingDs && (
            <>
              {/* Feature selector */}
              <div className="card">
                <div className="section-title mb-1">Select Features</div>
                <p className="text-neural-muted text-xs mb-4">Choose which columns the model will use for prediction</p>
                <div className="flex flex-wrap gap-2">
                  {dataset.feature_columns?.map(col => (
                    <button key={col} onClick={() => toggleFeature(col)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all
                        ${features.includes(col) ? 'border-neural-accent bg-neural-accent/10 text-neural-accent' : 'border-neural-border text-neural-muted hover:border-neural-accent/40'}`}>
                      {col}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="text-neural-muted text-xs">Target: <span className="text-neural-xp font-mono">{dataset.target_column}</span></div>
                  <div className="text-neural-muted text-xs ml-auto">{features.length} features selected</div>
                  <button onClick={handleRunModel} disabled={features.length === 0 || running || !pyReady}
                    className="btn-primary text-sm flex items-center gap-2">
                    {running ? <span className="w-4 h-4 border-2 border-neural-bg border-t-transparent rounded-full animate-spin" /> : '▶'}
                    Train Model
                  </button>
                </div>
              </div>

              {/* Data preview */}
              <div className="card overflow-hidden">
                <div className="section-title mb-3">Data Preview (first 5 rows)</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>{dataset.columns?.slice(0, 6).map(c => (
                        <th key={c.name} className="text-left bg-neural-surface border border-neural-border px-3 py-2 text-neural-muted font-mono whitespace-nowrap">{c.name}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {dataset.rows?.slice(0, 5).map((row, i) => (
                        <tr key={i}>{dataset.columns?.slice(0, 6).map(c => (
                          <td key={c.name} className="border border-neural-border px-3 py-2 text-neural-muted font-mono whitespace-nowrap">
                            {String(row[c.name])?.slice(0, 15)}
                          </td>
                        ))}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Results */}
              {results && (
                <div className="card border-neural-success/30">
                  <div className="section-title mb-4">Model Results</div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-neural-success font-heading font-bold text-2xl">{results.value}{results.metric === 'Accuracy' ? '%' : ''}</div>
                      <div className="text-neural-muted text-xs mt-1">{results.metric}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-neural-accent font-heading font-bold text-2xl">{results.n_train}</div>
                      <div className="text-neural-muted text-xs mt-1">Train samples</div>
                    </div>
                    <div className="text-center">
                      <div className="text-neural-purple font-heading font-bold text-2xl">{results.n_test}</div>
                      <div className="text-neural-muted text-xs mt-1">Test samples</div>
                    </div>
                  </div>

                  {/* Sample prediction */}
                  <div className="bg-neural-surface border border-neural-border rounded-lg p-3 mb-3">
                    <div className="text-neural-muted text-xs mb-2">Sample prediction:</div>
                    <div className="text-neural-text font-mono text-sm">
                      Input: {Object.entries(results.sample_features || {}).slice(0, 3).map(([k, v]) => `${k}=${v}`).join(', ')}
                    </div>
                    <div className="text-neural-accent font-mono text-sm mt-1">→ Prediction: {results.sample_prediction}</div>
                  </div>

                  <button onClick={handleExplain} disabled={explaining} className="btn-secondary text-sm flex items-center gap-2">
                    {explaining ? <span className="w-4 h-4 border border-neural-muted border-t-transparent rounded-full animate-spin" /> : '🤖'}
                    Explain This Prediction
                  </button>

                  {explanation && (
                    <div className="mt-3 p-3 bg-neural-accent/5 border border-neural-accent/20 rounded-lg">
                      <div className="text-neural-accent text-xs font-semibold mb-1">AI Explanation</div>
                      <p className="text-neural-text text-sm leading-relaxed">{explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {!dataset && !loadingDs && (
            <div className="card border-dashed text-center py-16">
              <div className="text-4xl mb-3">🔬</div>
              <p className="text-neural-muted">Select a dataset to explore and build models</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
