from django.core.management.base import BaseCommand
from apps.datasets.models import Dataset


class Command(BaseCommand):
    help = 'Seeds Iris and MNIST digit datasets into the database'

    def handle(self, *args, **options):
        self.seed_iris()
        self.seed_digits()
        self.seed_titanic()
        self.stdout.write(self.style.SUCCESS('Datasets seeded successfully!'))

    def seed_iris(self):
        from sklearn.datasets import load_iris
        import pandas as pd
        data = load_iris(as_frame=True)
        df = data.frame.copy()
        df['species'] = [data.target_names[t] for t in df['target']]

        Dataset.objects.update_or_create(
            name='iris',
            defaults={
                'display_name': 'Iris Flower Classification',
                'description': 'Classify iris flowers into 3 species (setosa, versicolor, virginica) based on petal and sepal measurements. A classic beginner dataset with 150 samples and 4 features.',
                'columns': [{'name': c, 'type': 'float' if c != 'species' else 'string', 'description': c.replace('_', ' ').title()} for c in df.columns],
                'rows': df.to_dict(orient='records'),
                'task_type': 'classification',
                'target_column': 'species',
                'feature_columns': list(data.feature_names),
            }
        )
        self.stdout.write(f'  Iris seeded ({len(df)} rows)')

    def seed_digits(self):
        from sklearn.datasets import load_digits
        import pandas as pd
        data = load_digits(as_frame=True)
        df = data.frame.head(300).copy()

        Dataset.objects.update_or_create(
            name='mnist_digits',
            defaults={
                'display_name': 'MNIST Digit Recognition (sample)',
                'description': 'Recognize handwritten digits 0–9 from 8×8 pixel grayscale images. A sample of 300 rows for in-browser demonstration.',
                'columns': [{'name': c, 'type': 'int', 'description': f'Pixel {c}'} for c in df.columns],
                'rows': df.to_dict(orient='records'),
                'task_type': 'classification',
                'target_column': 'target',
                'feature_columns': [c for c in df.columns if c != 'target'],
            }
        )
        self.stdout.write(f'  MNIST digits seeded (300 rows)')

    def seed_titanic(self):
        """Seed Titanic using a hardcoded small sample (no Kaggle required)."""
        import pandas as pd

        # Hardcoded sample — representative subset
        rows = [
            {'Survived': 0, 'Pclass': 3, 'Sex': 'male', 'Age': 22, 'SibSp': 1, 'Parch': 0, 'Fare': 7.25},
            {'Survived': 1, 'Pclass': 1, 'Sex': 'female', 'Age': 38, 'SibSp': 1, 'Parch': 0, 'Fare': 71.28},
            {'Survived': 1, 'Pclass': 3, 'Sex': 'female', 'Age': 26, 'SibSp': 0, 'Parch': 0, 'Fare': 7.93},
            {'Survived': 1, 'Pclass': 1, 'Sex': 'female', 'Age': 35, 'SibSp': 1, 'Parch': 0, 'Fare': 53.1},
            {'Survived': 0, 'Pclass': 3, 'Sex': 'male', 'Age': 35, 'SibSp': 0, 'Parch': 0, 'Fare': 8.05},
            {'Survived': 0, 'Pclass': 1, 'Sex': 'male', 'Age': 54, 'SibSp': 0, 'Parch': 0, 'Fare': 51.86},
            {'Survived': 0, 'Pclass': 3, 'Sex': 'male', 'Age': 2, 'SibSp': 3, 'Parch': 1, 'Fare': 21.07},
            {'Survived': 1, 'Pclass': 3, 'Sex': 'female', 'Age': 27, 'SibSp': 0, 'Parch': 2, 'Fare': 11.13},
            {'Survived': 1, 'Pclass': 2, 'Sex': 'female', 'Age': 14, 'SibSp': 1, 'Parch': 0, 'Fare': 30.07},
            {'Survived': 1, 'Pclass': 3, 'Sex': 'female', 'Age': 4, 'SibSp': 1, 'Parch': 1, 'Fare': 16.7},
            {'Survived': 0, 'Pclass': 3, 'Sex': 'male', 'Age': 20, 'SibSp': 0, 'Parch': 0, 'Fare': 8.05},
            {'Survived': 0, 'Pclass': 1, 'Sex': 'male', 'Age': 39, 'SibSp': 1, 'Parch': 5, 'Fare': 83.47},
            {'Survived': 0, 'Pclass': 3, 'Sex': 'female', 'Age': 14, 'SibSp': 0, 'Parch': 0, 'Fare': 7.85},
            {'Survived': 0, 'Pclass': 3, 'Sex': 'male', 'Age': 31, 'SibSp': 1, 'Parch': 0, 'Fare': 9.84},
            {'Survived': 1, 'Pclass': 2, 'Sex': 'female', 'Age': 55, 'SibSp': 0, 'Parch': 0, 'Fare': 16.0},
            {'Survived': 0, 'Pclass': 3, 'Sex': 'male', 'Age': 25, 'SibSp': 0, 'Parch': 0, 'Fare': 7.85},
            {'Survived': 1, 'Pclass': 3, 'Sex': 'male', 'Age': 0.83, 'SibSp': 1, 'Parch': 2, 'Fare': 18.75},
            {'Survived': 0, 'Pclass': 3, 'Sex': 'female', 'Age': 31, 'SibSp': 1, 'Parch': 0, 'Fare': 18.0},
            {'Survived': 1, 'Pclass': 1, 'Sex': 'female', 'Age': 30, 'SibSp': 0, 'Parch': 0, 'Fare': 247.52},
            {'Survived': 0, 'Pclass': 3, 'Sex': 'male', 'Age': 22, 'SibSp': 0, 'Parch': 0, 'Fare': 7.23},
            {'Survived': 1, 'Pclass': 2, 'Sex': 'female', 'Age': 36, 'SibSp': 1, 'Parch': 0, 'Fare': 15.55},
            {'Survived': 0, 'Pclass': 3, 'Sex': 'male', 'Age': 25, 'SibSp': 0, 'Parch': 0, 'Fare': 7.86},
            {'Survived': 1, 'Pclass': 1, 'Sex': 'female', 'Age': 58, 'SibSp': 0, 'Parch': 0, 'Fare': 26.55},
            {'Survived': 0, 'Pclass': 3, 'Sex': 'male', 'Age': 30, 'SibSp': 0, 'Parch': 0, 'Fare': 7.23},
            {'Survived': 1, 'Pclass': 1, 'Sex': 'female', 'Age': 43, 'SibSp': 1, 'Parch': 0, 'Fare': 211.34},
        ]

        columns = [
            {'name': 'Survived', 'type': 'int', 'description': 'Survival (0=No, 1=Yes)'},
            {'name': 'Pclass', 'type': 'int', 'description': 'Passenger class (1=1st, 2=2nd, 3=3rd)'},
            {'name': 'Sex', 'type': 'string', 'description': 'Gender'},
            {'name': 'Age', 'type': 'float', 'description': 'Age in years'},
            {'name': 'SibSp', 'type': 'int', 'description': 'Siblings/spouses aboard'},
            {'name': 'Parch', 'type': 'int', 'description': 'Parents/children aboard'},
            {'name': 'Fare', 'type': 'float', 'description': 'Ticket fare (£)'},
        ]

        Dataset.objects.update_or_create(
            name='titanic',
            defaults={
                'display_name': 'Titanic Survival Prediction',
                'description': 'Predict whether a Titanic passenger survived based on their class, gender, age, and fare. A classic binary classification problem.',
                'columns': columns,
                'rows': rows,
                'task_type': 'classification',
                'target_column': 'Survived',
                'feature_columns': ['Pclass', 'Age', 'SibSp', 'Parch', 'Fare'],
            }
        )
        self.stdout.write(f'  Titanic seeded ({len(rows)} rows - hardcoded sample)')
