from django.db import models


class Dataset(models.Model):
    TASK_TYPES = [('classification', 'Classification'), ('regression', 'Regression')]
    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=200)
    description = models.TextField()
    columns = models.JSONField()
    rows = models.JSONField()
    task_type = models.CharField(max_length=20, choices=TASK_TYPES)
    target_column = models.CharField(max_length=100)
    feature_columns = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.display_name

    def row_count(self):
        return len(self.rows) if self.rows else 0
