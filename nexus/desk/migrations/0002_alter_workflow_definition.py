# Generated by Django 5.0.3 on 2024-03-20 10:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("desk", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="workflow",
            name="definition",
            field=models.JSONField(
                help_text="A JSON object mapping fields from the source form to fields in the destination form"
            ),
        ),
    ]