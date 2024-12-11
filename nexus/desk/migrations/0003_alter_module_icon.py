# Generated by Django 5.0.4 on 2024-08-25 05:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("desk", "0002_alter_workflow_definition"),
    ]

    operations = [
        migrations.AlterField(
            model_name="module",
            name="icon",
            field=models.CharField(
                blank=True,
                help_text="The icon to be used from the MUI icons set (https://mui.com/material-ui/material-icons)",
                max_length=50,
                null=True,
            ),
        ),
    ]