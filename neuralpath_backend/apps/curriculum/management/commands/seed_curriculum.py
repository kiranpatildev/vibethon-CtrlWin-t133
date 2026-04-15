from django.core.management.base import BaseCommand
from apps.curriculum.models import LearningTrack, Module, Lesson
from apps.quiz.models import Quiz, Question


class Command(BaseCommand):
    help = 'Seeds curriculum content: tracks, modules, lessons, and quizzes'

    def handle(self, *args, **options):
        self.seed_tracks()
        self.seed_beginner()
        self.seed_practitioner()
        self.seed_advanced()
        self.seed_quizzes()
        self.stdout.write(self.style.SUCCESS('Curriculum seeded successfully!'))

    def seed_tracks(self):
        tracks = [
            {'name': 'Beginner Track', 'track_level': 'beginner', 'order': 1,
             'description': 'Start your AI/ML journey. Learn the fundamentals of machine learning, explore data, and build your first classifier.',
             'icon': 'rocket'},
            {'name': 'Practitioner Track', 'track_level': 'practitioner', 'order': 2,
             'description': 'Go deeper. Build neural networks from scratch, master model evaluation, and tackle real-world datasets.',
             'icon': 'brain'},
            {'name': 'Advanced Track', 'track_level': 'advanced', 'order': 3,
             'description': 'Push the frontier. Explore transformers, attention mechanisms, and build end-to-end ML pipelines.',
             'icon': 'zap'},
        ]
        for t in tracks:
            LearningTrack.objects.update_or_create(track_level=t['track_level'], defaults=t)
        self.stdout.write('  Tracks seeded')

    def seed_beginner(self):
        beginner = LearningTrack.objects.get(track_level='beginner')

        m1, _ = Module.objects.update_or_create(slug='what-is-ml', defaults={
            'track': beginner,
            'title': 'What is Machine Learning?',
            'description': 'Understand the three paradigms of ML and the end-to-end workflow from raw data to deployed model.',
            'order': 1, 'estimated_minutes': 20, 'xp_reward': 50, 'skill_category': 'fundamentals',
        })

        Lesson.objects.update_or_create(module=m1, order=1, defaults={
            'title': 'Types of Machine Learning',
            'content_markdown': """## Types of Machine Learning

Machine learning is the science of getting computers to learn from data without being explicitly programmed. It sits at the intersection of statistics, computer science, and domain expertise.

### Supervised Learning
In supervised learning, the algorithm learns from **labeled training data** — examples where the correct answer is already known. Think of it as learning with a teacher.

**Examples:**
- Email spam detection (spam / not spam)
- House price prediction (given size, location → price)
- Image classification (cat / dog / car)

The algorithm finds patterns between inputs and outputs, then uses those patterns to predict outputs for new, unseen inputs.

### Unsupervised Learning
Here, the algorithm finds **hidden patterns in unlabeled data** — no correct answers provided. It discovers structure on its own.

**Examples:**
- Customer segmentation (grouping shoppers by behavior)
- Anomaly detection (finding unusual credit card transactions)
- Topic modeling (finding themes in news articles)

The most common unsupervised technique is **clustering** — grouping similar data points together.

### Reinforcement Learning
An agent learns by **interacting with an environment** and receiving rewards or penalties. Like training a dog: good behavior earns treats.

**Examples:**
- Game-playing AI (AlphaGo, OpenAI Five)
- Robot locomotion
- Recommendation systems

The agent's goal is to maximize cumulative reward over time — discovering strategies through trial and error.

### Which to use?
- Have labeled data? → **Supervised**
- No labels, want to find structure? → **Unsupervised**
- Have an environment with rewards? → **Reinforcement**
""",
            'has_code_challenge': False,
        })

        Lesson.objects.update_or_create(module=m1, order=2, defaults={
            'title': 'The ML Workflow',
            'content_markdown': """## The Machine Learning Workflow

Every successful ML project follows a similar lifecycle. Understanding this workflow prevents the most common mistakes.

### Step 1: Define the Problem
Before touching data or code, ask: *What exactly am I predicting? What does success look like?*

A vague goal like "improve sales" becomes a concrete ML problem: "Predict which customers will churn in the next 30 days (binary classification, target: F1 > 0.80)."

### Step 2: Collect and Explore Data
Data is the fuel of ML. You need enough of it, and it needs to be relevant. **Exploratory Data Analysis (EDA)** reveals:
- Missing values
- Outliers
- Class imbalance
- Feature distributions

The golden rule: **garbage in, garbage out**. No algorithm can fix fundamentally bad data.

### Step 3: Preprocess and Engineer Features
Raw data rarely arrives ready for training. You'll:
- Handle missing values (imputation, deletion)
- Encode categorical variables (one-hot, ordinal)
- Scale numerical features (normalization, standardization)
- Create new features from existing ones (feature engineering)

### Step 4: Choose and Train a Model
Select an algorithm appropriate for your problem type. Start simple (linear models, decision trees) before jumping to complex ones (neural networks, ensembles).

Split your data: **80% training, 20% testing**. Never let the model see test data during training.

### Step 5: Evaluate
Measure performance on the held-out test set using appropriate metrics:
- Classification: Accuracy, Precision, Recall, F1, AUC-ROC
- Regression: MAE, RMSE, R²

### Step 6: Iterate and Deploy
Rarely does the first model suffice. You iterate — tune hyperparameters, add features, try different algorithms — until performance is acceptable, then deploy to production.
""",
            'has_code_challenge': False,
        })

        Lesson.objects.update_or_create(module=m1, order=3, defaults={
            'title': 'Explore the Iris Dataset',
            'content_markdown': """## Code Challenge: Explore the Iris Dataset

The Iris dataset is ML's "Hello World" — 150 flower samples, 4 measurements each, 3 species to classify.

Your task is to load the dataset, inspect its shape, and compute basic statistics.

### What You'll Practice
- Loading a built-in sklearn dataset
- Converting to a pandas DataFrame
- Using `.describe()` for summary statistics
- Counting class distribution with `.value_counts()`
""",
            'has_code_challenge': True,
            'starter_code': """from sklearn.datasets import load_iris
import pandas as pd

# Load the iris dataset
data = load_iris(as_frame=True)
df = data.frame
df['species'] = data.target_names[df['target']]

# TODO: Print the first 5 rows
print(df.head())

# TODO: Print the shape of the dataset
print("Shape:", df.shape)

# TODO: Print basic statistics
print(df.describe())

# TODO: Count samples per species
print(df['species'].value_counts())
""",
            'solution_code': """from sklearn.datasets import load_iris
import pandas as pd

data = load_iris(as_frame=True)
df = data.frame
df['species'] = data.target_names[df['target']]

print(df.head())
print("Shape:", df.shape)
print(df.describe())
print(df['species'].value_counts())
""",
            'test_cases': [
                {'input': '', 'expected_output_contains': '150', 'description': 'Dataset has 150 rows'},
                {'input': '', 'expected_output_contains': 'setosa', 'description': 'Contains iris species'},
            ],
        })

        m2, _ = Module.objects.update_or_create(slug='your-first-classifier', defaults={
            'track': beginner,
            'title': 'Your First Classifier',
            'description': 'Build intuition for K-Nearest Neighbors and decision boundaries. Train a real classifier.',
            'order': 2, 'estimated_minutes': 25, 'xp_reward': 60, 'skill_category': 'tabular',
        })

        Lesson.objects.update_or_create(module=m2, order=1, defaults={
            'title': 'K-Nearest Neighbors Intuition',
            'content_markdown': """## K-Nearest Neighbors (KNN)

KNN is one of the most intuitive algorithms in all of machine learning. The idea: **classify a new point by looking at its K nearest neighbors**.

### The Algorithm
1. Choose K (a hyperparameter you set, e.g., K=3)
2. For a new data point, compute its distance to every training point
3. Find the K closest training points
4. The majority class among those K neighbors becomes the prediction

### A Real-World Analogy
Imagine you move to a new city and want to know if a neighborhood is safe. You ask your 5 nearest neighbors about their experience. If 4 out of 5 say it's great, you conclude it's probably good. That's KNN.

### Choosing K
- **Small K** (K=1): Very sensitive to noise. Overfits. Decision boundary is jagged.
- **Large K** (K=all): Ignores local structure. Underfits. Everything gets classified as the majority class.
- **Sweet spot**: Usually K = √n where n is the number of training samples. Always use an odd K for binary classification to avoid ties.

### Distance Metrics
The most common is **Euclidean distance**: √(Σ(xᵢ - yᵢ)²)

For high-dimensional data, use **Manhattan distance** or **cosine similarity** — Euclidean distance becomes less meaningful in high dimensions (the "curse of dimensionality").

### Strengths and Weaknesses
✅ No training phase — just memorizes data  
✅ Naturally handles multi-class problems  
✅ Great baseline algorithm  

❌ Slow at prediction time (must compute all distances)  
❌ Sensitive to irrelevant features  
❌ Requires feature scaling (normalize your data!)  
""",
            'has_code_challenge': False,
        })

        Lesson.objects.update_or_create(module=m2, order=2, defaults={
            'title': 'Decision Boundaries',
            'content_markdown': """## Decision Boundaries

A decision boundary is the line (or surface) that separates different classes in feature space. Understanding boundaries helps you choose the right algorithm.

### What Shapes Can Boundaries Take?

**Linear classifiers** (Logistic Regression, SVM with linear kernel) draw straight lines:
- Simple, fast, interpretable
- Fail when classes aren't linearly separable

**KNN** creates complex, non-linear boundaries that adapt to data shape:
- Boundary shape depends entirely on training data layout
- Small K → very jagged boundary
- Large K → smoother boundary

**Decision Trees** create axis-aligned rectangular boundaries:
- Each split is perpendicular to a feature axis
- Can approximate any boundary with enough depth, but overfit easily

### The Bias-Variance Tradeoff
Every algorithm balances two sources of error:

**Bias**: Error from wrong assumptions. High bias = underfitting (model too simple). The model misses relevant patterns.

**Variance**: Error from sensitivity to training data. High variance = overfitting (model too complex). The model memorizes noise instead of patterns.

The goal: find the sweet spot where total error (bias² + variance) is minimized.

A K=1 KNN has near-zero bias but high variance. A K=all KNN has high bias but near-zero variance. The best K is somewhere in between.
""",
            'has_code_challenge': False,
        })

        Lesson.objects.update_or_create(module=m2, order=3, defaults={
            'title': 'Train a KNN Classifier',
            'content_markdown': """## Code Challenge: Train Your First KNN Classifier

Time to put theory into practice! You'll train a KNN classifier on the Iris dataset and measure its accuracy.
""",
            'has_code_challenge': True,
            'starter_code': """from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score

# Load data
data = load_iris(as_frame=True)
X = data.data
y = data.target

# TODO: Split into train/test (80/20, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# TODO: Create a KNN classifier with k=5 and fit it
knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_train, y_train)

# TODO: Predict on the test set
y_pred = knn.predict(X_test)

# TODO: Print the accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f"KNN Accuracy (k=5): {accuracy:.2%}")
""",
            'solution_code': """from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score

data = load_iris(as_frame=True)
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_train, y_train)
y_pred = knn.predict(X_test)
print(f"KNN Accuracy (k=5): {accuracy_score(y_test, y_pred):.2%}")
""",
            'test_cases': [
                {'input': '', 'expected_output_contains': '%', 'description': 'Should print accuracy percentage'},
                {'input': '', 'expected_output_contains': 'KNN', 'description': 'Should label the output'},
            ],
        })
        self.stdout.write('  Beginner track seeded')

    def seed_practitioner(self):
        practitioner = LearningTrack.objects.get(track_level='practitioner')

        m3, _ = Module.objects.update_or_create(slug='neural-networks-from-scratch', defaults={
            'track': practitioner,
            'title': 'Neural Networks from Scratch',
            'description': 'Build a perceptron, understand activation functions, and implement backpropagation with NumPy.',
            'order': 3, 'estimated_minutes': 35, 'xp_reward': 80, 'skill_category': 'fundamentals',
        })

        Lesson.objects.update_or_create(module=m3, order=1, defaults={
            'title': 'The Perceptron and Activation Functions',
            'content_markdown': """## The Perceptron: Building Block of Neural Networks

A perceptron is the simplest neural network — a single artificial neuron. It takes inputs, multiplies them by weights, sums them up, adds a bias, then passes the result through an activation function.

### The Math
```
output = activation(w₁x₁ + w₂x₂ + ... + wₙxₙ + b)
```

- **xᵢ**: input features
- **wᵢ**: learned weights (how important each input is)
- **b**: bias (shifts the activation threshold)
- **activation**: nonlinear function applied to the weighted sum

### Why Do We Need Activation Functions?
Without an activation function, a neural network — no matter how many layers — is just a linear transformation. It can only learn linear relationships.

Activation functions introduce **nonlinearity**, allowing networks to learn arbitrary complex patterns.

### Common Activation Functions

**Sigmoid**: σ(x) = 1/(1+e⁻ˣ)
- Output range: (0, 1) — great for binary classification output
- Problem: vanishing gradients in deep networks

**ReLU (Rectified Linear Unit)**: f(x) = max(0, x)  
- Output: 0 if negative, x if positive
- The default choice for hidden layers
- Fast to compute; doesn't saturate for positive values

**Tanh**: tanh(x) = (eˣ - e⁻ˣ)/(eˣ + e⁻ˣ)
- Output range: (-1, 1) — zero-centered (helps training)
- Still suffers from vanishing gradients

**Softmax**: converts a vector of numbers into a probability distribution
- Used in the output layer for multi-class classification
- Ensures all outputs sum to 1
""",
            'has_code_challenge': False,
        })

        Lesson.objects.update_or_create(module=m3, order=2, defaults={
            'title': 'Backpropagation Intuition',
            'content_markdown': """## Backpropagation: How Neural Networks Learn

Backpropagation is the algorithm that trains neural networks. It's just the **chain rule of calculus applied efficiently** to compute how much each weight contributed to the error.

### The Forward Pass
Data flows **forward** through the network, layer by layer:
1. Input layer receives features
2. Each neuron computes: weighted sum → activation → output
3. Final layer produces a prediction

### The Loss Function
We measure how wrong our prediction is using a **loss function**:
- **Mean Squared Error (MSE)** for regression: L = (1/n)Σ(ŷ - y)²
- **Cross-Entropy** for classification: L = -Σ y·log(ŷ)

The loss is a single number: 0 means perfect, higher means worse.

### The Backward Pass
Now we need to adjust weights to reduce loss. We compute:

**How much does the loss change if we change each weight?**

This is the gradient — a vector pointing in the direction of steepest increase in loss. We move in the opposite direction (gradient descent).

Using the chain rule:
```
∂L/∂w = ∂L/∂output × ∂output/∂z × ∂z/∂w
```

Where z is the weighted sum before activation.

### Gradient Descent Update Rule
After computing gradients, we update each weight:
```
w = w - learning_rate × ∂L/∂w
```

The **learning rate** (η) controls the step size:
- Too large: overshoots the minimum, diverges
- Too small: very slow convergence
- Just right: smoothly descends to a good minimum
""",
            'has_code_challenge': False,
        })

        Lesson.objects.update_or_create(module=m3, order=3, defaults={
            'title': 'Implement a 1-Layer Network with NumPy',
            'content_markdown': """## Code Challenge: Neural Network from Scratch

Implement a single-layer neural network using only NumPy. No PyTorch, no TensorFlow — just math.
""",
            'has_code_challenge': True,
            'starter_code': """import numpy as np

# Sigmoid activation
def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def sigmoid_derivative(x):
    s = sigmoid(x)
    return s * (1 - s)

# XOR dataset
X = np.array([[0,0],[0,1],[1,0],[1,1]])
y = np.array([[0],[1],[1],[0]])

np.random.seed(42)
# TODO: Initialize weights (2 inputs → 4 hidden → 1 output)
W1 = np.random.randn(2, 4) * 0.1
b1 = np.zeros((1, 4))
W2 = np.random.randn(4, 1) * 0.1
b2 = np.zeros((1, 1))

lr = 0.1
for epoch in range(1000):
    # Forward pass
    z1 = X @ W1 + b1
    a1 = sigmoid(z1)
    z2 = a1 @ W2 + b2
    output = sigmoid(z2)

    # Loss (MSE)
    loss = np.mean((output - y) ** 2)

    # Backward pass
    dL_dout = 2 * (output - y) / len(y)
    dout_dz2 = sigmoid_derivative(z2)
    dz2_dW2 = a1.T
    dW2 = dz2_dW2 @ (dL_dout * dout_dz2)
    db2 = np.sum(dL_dout * dout_dz2, axis=0)

    dL_da1 = (dL_dout * dout_dz2) @ W2.T
    da1_dz1 = sigmoid_derivative(z1)
    dW1 = X.T @ (dL_da1 * da1_dz1)
    db1 = np.sum(dL_da1 * da1_dz1, axis=0)

    # Update weights
    W2 -= lr * dW2
    b2 -= lr * db2
    W1 -= lr * dW1
    b1 -= lr * db1

print(f"Final loss: {loss:.4f}")
print(f"Predictions: {output.flatten().round(2)}")
print(f"Expected:    {y.flatten()}")
""",
            'solution_code': """import numpy as np
def sigmoid(x): return 1 / (1 + np.exp(-x))
def sigmoid_derivative(x): s = sigmoid(x); return s * (1 - s)
X = np.array([[0,0],[0,1],[1,0],[1,1]])
y = np.array([[0],[1],[1],[0]])
np.random.seed(42)
W1 = np.random.randn(2, 4) * 0.1; b1 = np.zeros((1, 4))
W2 = np.random.randn(4, 1) * 0.1; b2 = np.zeros((1, 1))
lr = 0.1
for _ in range(1000):
    z1 = X @ W1 + b1; a1 = sigmoid(z1)
    z2 = a1 @ W2 + b2; output = sigmoid(z2)
    loss = np.mean((output - y) ** 2)
    dL_dout = 2*(output-y)/len(y); dp2 = sigmoid_derivative(z2)
    dW2 = a1.T @ (dL_dout*dp2); db2 = np.sum(dL_dout*dp2, axis=0)
    dL_da1 = (dL_dout*dp2) @ W2.T; dp1 = sigmoid_derivative(z1)
    dW1 = X.T @ (dL_da1*dp1); db1 = np.sum(dL_da1*dp1, axis=0)
    W2 -= lr*dW2; b2 -= lr*db2; W1 -= lr*dW1; b1 -= lr*db1
print(f"Final loss: {loss:.4f}")
print(f"Predictions: {output.flatten().round(2)}")
""",
            'test_cases': [{'input': '', 'expected_output_contains': 'loss', 'description': 'Should print final loss'}],
        })

        m4, _ = Module.objects.update_or_create(slug='model-evaluation', defaults={
            'track': practitioner,
            'title': 'Model Evaluation',
            'description': 'Master train/test splits, overfitting, and key metrics: accuracy, precision, recall, F1.',
            'order': 4, 'estimated_minutes': 25, 'xp_reward': 70, 'skill_category': 'model_evaluation',
        })

        Lesson.objects.update_or_create(module=m4, order=1, defaults={
            'title': 'Train/Test Split and Overfitting',
            'content_markdown': """## Train/Test Split and Overfitting

One of the most critical concepts in ML: **never evaluate your model on the data it was trained on**.

### Why Split?
A model can *memorize* training data — achieving 100% training accuracy while failing completely on new data. This is **overfitting**.

By holding out a test set that the model never sees during training, we get an honest estimate of real-world performance.

### The Three-Way Split
For serious projects, use three sets:

| Set | Typical % | Purpose |
|-----|-----------|---------|
| Training | 60-70% | Model learns from this |
| Validation | 10-20% | Tune hyperparameters |
| Test | 20% | Final honest evaluation |

The validation set is used during development. The test set is touched exactly **once** — at the very end.

### Recognizing Overfitting
| Symptom | Diagnosis |
|---------|-----------|
| Training accuracy >> Test accuracy | Overfitting |
| Both low | Underfitting |
| Both high and close | Good fit ✅ |

### Remedies for Overfitting
- **More data**: The most powerful fix
- **Regularization**: L1 (Lasso), L2 (Ridge) — penalizes large weights
- **Dropout**: In neural networks, randomly disable neurons during training
- **Simpler model**: Reduce depth/complexity
- **Early stopping**: Stop training when validation loss starts increasing
""",
            'has_code_challenge': False,
        })

        Lesson.objects.update_or_create(module=m4, order=2, defaults={
            'title': 'Accuracy, Precision, Recall, F1',
            'content_markdown': """## Beyond Accuracy: Real Evaluation Metrics

Accuracy is intuitive but **misleading** for imbalanced datasets. If 99% of emails are not spam, a classifier that always says "not spam" achieves 99% accuracy — yet it's useless.

### The Confusion Matrix
For binary classification, 4 outcomes are possible:

| | Predicted Positive | Predicted Negative |
|---|---|---|
| **Actually Positive** | True Positive (TP) | False Negative (FN) |
| **Actually Negative** | False Positive (FP) | True Negative (TN) |

### Key Metrics

**Precision** = TP / (TP + FP)
> "Of all the times I said Positive, how often was I right?"
> High precision = low false alarm rate. Important when false positives are costly (spam filter flagging real emails).

**Recall (Sensitivity)** = TP / (TP + FN)
> "Of all actual Positives, how many did I catch?"
> High recall = few missed cases. Critical when false negatives are costly (cancer screening).

**F1 Score** = 2 × (Precision × Recall) / (Precision + Recall)
> Harmonic mean of precision and recall. Use when you need a single metric that balances both.

**Accuracy** = (TP + TN) / (TP + TN + FP + FN)
> Only reliable when classes are balanced.

### The Precision-Recall Tradeoff
Raising the classification threshold improves precision but hurts recall. Lowering it does the opposite. The **ROC curve** (and AUC score) visualizes this tradeoff across all thresholds.
""",
            'has_code_challenge': False,
        })

        Lesson.objects.update_or_create(module=m4, order=3, defaults={
            'title': 'Evaluate a Classifier on Real Data',
            'content_markdown': """## Code Challenge: Full Evaluation Pipeline

Generate a classification report with precision, recall, and F1 for a breast cancer dataset.
""",
            'has_code_challenge': True,
            'starter_code': """from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

data = load_breast_cancer()
X, y = data.data, data.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# TODO: Train a RandomForestClassifier
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# TODO: Predict on test set
y_pred = model.predict(X_test)

# TODO: Print classification report
print(classification_report(y_test, y_pred, target_names=data.target_names))
print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))
""",
            'solution_code': """from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred, target_names=data.target_names))
print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))
""",
            'test_cases': [{'input': '', 'expected_output_contains': 'precision', 'description': 'Should show classification report'}],
        })
        self.stdout.write('  Practitioner track seeded')

    def seed_advanced(self):
        advanced = LearningTrack.objects.get(track_level='advanced')

        m5, _ = Module.objects.update_or_create(slug='intro-to-transformers', defaults={
            'track': advanced,
            'title': 'Introduction to Transformers',
            'description': 'Demystify attention mechanisms, BERT, GPT, and learn prompt engineering basics.',
            'order': 5, 'estimated_minutes': 30, 'xp_reward': 90, 'skill_category': 'nlp',
        })

        Lesson.objects.update_or_create(module=m5, order=1, defaults={
            'title': 'The Attention Mechanism',
            'content_markdown': """## Attention: The Core of Transformers

Before transformers, sequence models (RNNs, LSTMs) processed text word by word — bottlenecking all information through a single "context vector." Long-range dependencies were hard to capture.

**Attention** solves this by allowing the model to directly access any part of the input sequence when generating each output.

### The Key Insight
When translating "The cat sat on the mat" to French, the word "cat" should attend strongly to "le chat" — regardless of its position in the sequence. Attention makes this direct lookup possible.

### Queries, Keys, and Values
Attention is computed using three learned projections:

- **Query (Q)**: What am I looking for?
- **Key (K)**: What information do I have?
- **Value (V)**: What do I actually output?

The attention score between a query and keys is:
```
Attention(Q, K, V) = softmax(QKᵀ / √dₖ) × V
```

The `√dₖ` scaling prevents dot products from getting too large in high dimensions (which would push softmax into regions with tiny gradients).

### Multi-Head Attention
Instead of one attention operation, transformers run **multiple attention heads in parallel** — each learning to attend to different aspects of the sequence (syntax, semantics, coreference, etc.).

The outputs are concatenated and projected back to the model dimension.

### Why Transformers Won
✅ Parallelizable — unlike RNNs, all positions computed simultaneously  
✅ Long-range dependencies — direct connections between any two positions  
✅ Scalable — performance improves predictably with more data and compute  
""",
            'has_code_challenge': False,
        })

        Lesson.objects.update_or_create(module=m5, order=2, defaults={
            'title': 'BERT and GPT — What They Are',
            'content_markdown': """## BERT vs GPT: Two Ways to Pretrain Transformers

Both BERT and GPT are transformer-based models pretrained on massive text corpora — but they differ fundamentally in architecture and what they're good at.

### BERT (Bidirectional Encoder Representations from Transformers)
**Architecture**: Encoder-only transformer  
**Training task**: Masked Language Modeling (MLM) + Next Sentence Prediction  

BERT reads the entire sentence at once (bidirectional), masking 15% of tokens and learning to predict them from context on both sides.

**Best for**: Understanding tasks
- Text classification
- Named Entity Recognition (NER)
- Question Answering (extractive)
- Sentiment analysis

### GPT (Generative Pre-trained Transformer)
**Architecture**: Decoder-only transformer  
**Training task**: Causal Language Modeling (predict next token)  

GPT processes text left-to-right. It's trained to predict the next word given all previous words — a simple but extraordinarily powerful objective.

**Best for**: Generation tasks
- Text completion
- Summarization
- Code generation
- Chatbots (ChatGPT)

### The Scaling Laws
Research by Kaplan et al. (2020) showed: model performance improves as a predictable power law with more parameters, more data, and more compute. This discovery drove the "bigger is better" era of LLMs.

GPT-3 has 175B parameters. GPT-4 is rumored to be a mixture-of-experts with ~1.8T effective parameters. Scale is transformational.
""",
            'has_code_challenge': False,
        })

        Lesson.objects.update_or_create(module=m5, order=3, defaults={
            'title': 'Prompt Engineering Basics',
            'content_markdown': """## Prompt Engineering: Talking to LLMs Effectively

Prompt engineering is the craft of designing inputs to language models to get the outputs you want. As LLMs become more capable, this skill becomes increasingly valuable.

### Zero-Shot Prompting
Simply ask the model to do something without examples:
```
Classify the sentiment of this review as Positive, Negative, or Neutral:
"The product arrived on time and works perfectly."
```

Models like GPT-4 handle many tasks zero-shot due to their vast training knowledge.

### Few-Shot Prompting
Provide examples to guide the model's behavior:
```
Input: "I love this!" → Positive
Input: "Terrible experience." → Negative
Input: "It's okay." → Neutral
Input: "Absolutely blown away!" → 
```

Few-shot prompting is extremely effective — a handful of examples often rivals fine-tuning.

### Chain-of-Thought (CoT)
Ask the model to reason step by step:
```
Q: A store has 15 apples. They sell 7 and receive a shipment of 12. How many apples?
A: Let me think step by step:
   - Started with 15
   - Sold 7: 15 - 7 = 8
   - Received 12: 8 + 12 = 20
   Answer: 20 apples
```

CoT dramatically improves performance on math, logic, and multi-step reasoning tasks.

### Key Principles
1. **Be specific** — vague prompts get vague answers
2. **Set the role** — "You are an expert Python developer..."
3. **Give format instructions** — "Respond in JSON with keys: name, age, city"
4. **Iterate** — treat prompts like code: test, debug, refine
""",
            'has_code_challenge': False,
        })

        m6, _ = Module.objects.update_or_create(slug='real-ml-pipeline', defaults={
            'track': advanced,
            'title': 'Building a Real ML Pipeline',
            'description': 'Feature engineering, cross-validation, hyperparameter tuning, and end-to-end pipeline implementation.',
            'order': 6, 'estimated_minutes': 40, 'xp_reward': 100, 'skill_category': 'data_preprocessing',
        })

        Lesson.objects.update_or_create(module=m6, order=1, defaults={
            'title': 'Feature Engineering',
            'content_markdown': """## Feature Engineering: Turning Raw Data into Model Inputs

Feature engineering is often the difference between a mediocre model and a great one. It's the process of using domain knowledge to create input variables that make patterns easier for algorithms to detect.

### Why It Matters
An algorithm can only learn what's in its features. If the signal isn't there, no amount of model complexity will help.

### Common Techniques

**Binning/Discretization**: Convert continuous variables into categorical buckets
```python
df['age_group'] = pd.cut(df['age'], bins=[0,18,35,60,100], labels=['teen','young','middle','senior'])
```

**Interaction Features**: Multiply features to capture their combined effect
```python
df['bmi_age'] = df['bmi'] * df['age']  # captures age-BMI interaction
```

**Log Transformation**: Stabilizes skewed distributions (common for price, income)
```python
df['log_price'] = np.log1p(df['price'])  # log(1+x) handles zeros
```

**Date/Time Features**: Extract temporal signals
```python
df['hour'] = df['timestamp'].dt.hour
df['day_of_week'] = df['timestamp'].dt.dayofweek
df['is_weekend'] = df['day_of_week'].isin([5, 6])
```

**Target Encoding**: Replace categorical with target mean (careful — use cross-val to avoid leakage)

### Feature Selection
More features ≠ better model. Irrelevant features add noise.

Methods:
- **Correlation matrix**: Remove highly correlated features
- **Recursive Feature Elimination (RFE)**: Iteratively remove least important features
- **Feature importance**: From tree models (Random Forest, XGBoost)
- **LASSO**: L1 regularization zeros out irrelevant feature weights
""",
            'has_code_challenge': False,
        })

        Lesson.objects.update_or_create(module=m6, order=2, defaults={
            'title': 'Cross-Validation and Hyperparameter Tuning',
            'content_markdown': """## Cross-Validation: Reliable Performance Estimation

A single train/test split can be lucky or unlucky. **K-Fold Cross-Validation** mitigates this by training and evaluating K times, rotating which data is held out.

### K-Fold CV
```
Fold 1: [Test] [Train][Train][Train][Train]
Fold 2: [Train][Test] [Train][Train][Train]
Fold 3: [Train][Train][Test] [Train][Train]
...
Final score = mean of K fold scores ± standard deviation
```

K=5 or K=10 are standard choices. **Stratified K-Fold** maintains class proportions in each fold — always use this for classification.

### When to Use Cross-Validation
- Small datasets (< 10,000 samples): always
- To compare multiple models fairly
- For hyperparameter tuning

### Hyperparameter Tuning

**Grid Search**: Try every combination of specified values
```python
from sklearn.model_selection import GridSearchCV
params = {'n_estimators': [100, 200], 'max_depth': [5, 10, None]}
grid = GridSearchCV(RandomForestClassifier(), params, cv=5, scoring='f1')
grid.fit(X_train, y_train)
print(grid.best_params_)
```

**Random Search**: Sample randomly from parameter distributions — faster, often just as good:
```python
from sklearn.model_selection import RandomizedSearchCV
```

**Bayesian Optimization**: Use previous results to guide next trial (e.g., Optuna, Hyperopt). Best for expensive models.

### The Golden Rule
Always hold out a final test set that is never used during hyperparameter tuning. Otherwise, you've overfit to your test set.
""",
            'has_code_challenge': False,
        })

        Lesson.objects.update_or_create(module=m6, order=3, defaults={
            'title': 'End-to-End Pipeline on Real Data',
            'content_markdown': """## Code Challenge: Full ML Pipeline

Build a complete sklearn Pipeline with preprocessing + model training + cross-validation.
""",
            'has_code_challenge': True,
            'starter_code': """from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
import numpy as np

# Load dataset
data = fetch_california_housing()
X, y = data.data, data.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# TODO: Build a Pipeline: StandardScaler + GradientBoostingRegressor
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('model', GradientBoostingRegressor(n_estimators=100, random_state=42))
])

# TODO: Run 5-fold cross-validation (neg_mean_absolute_error)
cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring='neg_mean_absolute_error')
print(f"CV MAE: {-cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

# TODO: Fit on full training set, evaluate on test
pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)
print(f"Test MAE: {mean_absolute_error(y_test, y_pred):.4f}")
""",
            'solution_code': """from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
import numpy as np
data = fetch_california_housing()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
pipeline = Pipeline([('scaler', StandardScaler()), ('model', GradientBoostingRegressor(n_estimators=100, random_state=42))])
cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring='neg_mean_absolute_error')
print(f"CV MAE: {-cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
pipeline.fit(X_train, y_train)
print(f"Test MAE: {mean_absolute_error(y_test, pipeline.predict(X_test)):.4f}")
""",
            'test_cases': [{'input': '', 'expected_output_contains': 'MAE', 'description': 'Should print MAE scores'}],
        })
        self.stdout.write('  Advanced track seeded')

    def seed_quizzes(self):
        """Seed one quiz per module with 5 questions each."""
        quizzes_data = [
            {
                'module_slug': 'what-is-ml',
                'title': 'What is ML? — Quick Check',
                'difficulty': 'easy',
                'questions': [
                    {'text': 'Which type of machine learning uses labeled training data?',
                     'options': ['Unsupervised Learning', 'Supervised Learning', 'Reinforcement Learning', 'Transfer Learning'],
                     'correct': 1, 'explanation': 'Supervised learning trains on labeled data — input/output pairs.'},
                    {'text': 'What does "overfitting" mean in ML?',
                     'options': ['Model is too simple', 'Model memorizes training data but fails on new data', 'Model trains too slowly', 'Model uses too little data'],
                     'correct': 1, 'explanation': 'Overfitting is when a model learns noise in training data instead of generalizable patterns.'},
                    {'text': 'Which step comes AFTER data collection in the ML workflow?',
                     'options': ['Model deployment', 'Data preprocessing & EDA', 'Hyperparameter tuning', 'Production monitoring'],
                     'correct': 1, 'explanation': 'After collecting data, you explore and preprocess it before modeling.'},
                    {'text': 'What is a reinforcement learning "reward"?',
                     'options': ['A type of loss function', 'Feedback signal driving agent behavior', 'A dataset label', 'A model architecture'],
                     'correct': 1, 'explanation': 'Rewards (positive or negative) guide the agent to learn better behaviors over time.'},
                    {'text': 'Which metric is MOST appropriate for a highly imbalanced classification problem?',
                     'options': ['Accuracy', 'Mean Squared Error', 'F1 Score', 'R²'],
                     'correct': 2, 'explanation': 'F1 score balances precision and recall, making it robust for imbalanced datasets.'},
                ]
            },
            {
                'module_slug': 'your-first-classifier',
                'title': 'KNN and Classification — Quiz',
                'difficulty': 'easy',
                'questions': [
                    {'text': 'In KNN, what does "K" represent?',
                     'options': ['Learning rate', 'Number of nearest neighbors to vote', 'Number of features', 'Number of training epochs'],
                     'correct': 1, 'explanation': 'K is the number of nearest neighbors whose labels are used to vote for the prediction.'},
                    {'text': 'What is a decision boundary?',
                     'options': ['The training loss curve', 'The line/surface separating predicted classes', 'The validation set', 'The model architecture'],
                     'correct': 1, 'explanation': 'A decision boundary separates the feature space into regions corresponding to different class predictions.'},
                    {'text': 'What happens with very small K in KNN (e.g., K=1)?',
                     'options': ['Underfitting — model is too smooth', 'Overfitting — very sensitive to noise', 'Perfect accuracy always', 'Training becomes faster'],
                     'correct': 1, 'explanation': 'Small K creates jagged boundaries that overfit to training data noise.'},
                    {'text': 'Why should you normalize features before using KNN?',
                     'options': ['To speed up training', 'Because KNN uses distance — large-scale features dominate otherwise', 'To reduce overfitting', 'It is not necessary'],
                     'correct': 1, 'explanation': 'KNN is distance-based. Features with larger scales (e.g., 0-10000) will dominate over features with small scales (e.g., 0-1).'},
                    {'text': 'What does the bias-variance tradeoff describe?',
                     'options': ['Trade-off between training speed and accuracy', 'Trade-off between model complexity and generalization error', 'Trade-off between precision and recall', 'Trade-off between features and samples'],
                     'correct': 1, 'explanation': 'High bias = underfitting (model too simple). High variance = overfitting (model too complex). Good models balance both.'},
                ]
            },
        ]

        for qdata in quizzes_data:
            try:
                module = Module.objects.get(slug=qdata['module_slug'])
            except Module.DoesNotExist:
                continue
            quiz, _ = Quiz.objects.update_or_create(
                module=module, title=qdata['title'],
                defaults={'difficulty': qdata['difficulty'], 'is_ai_generated': False}
            )
            for i, q in enumerate(qdata['questions']):
                Question.objects.update_or_create(
                    quiz=quiz, order=i,
                    defaults={
                        'question_type': 'mcq',
                        'question_text': q['text'],
                        'options': q['options'],
                        'correct_answer': q['correct'],
                        'explanation': q['explanation'],
                    }
                )
        self.stdout.write('  Quizzes seeded')
