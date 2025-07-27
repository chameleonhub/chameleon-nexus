class KobocatRouter:
    """
    Routes models in the dashboard app to the kobocat database for read operations
    """
    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'dashboard':
            return 'kobocat'
        return None

    def db_for_write(self, model, **hints):
        # Prevent any writes to kobocat database
        if model._meta.app_label == 'dashboard':
            raise Exception("Writing to Kobocat database is not allowed")
        return None

    def allow_relation(self, obj1, obj2, **hints):
        # Allow relations only if both models are in the same database
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        # Only allow migrations on default database
        if db == 'kobocat':
            return False
        return True