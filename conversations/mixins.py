import logging

logger = logging.getLogger(__name__)

class LoggingMixin:
    def initialize_request(self, request, *args, **kwargs):
        request = super().initialize_request(request, *args, **kwargs)
        try:
            if request.user.is_authenticated:
                logger.info(f"Authenticated User: {request.user.username}")
            else:
                logger.info("User not authenticated")
            logger.info(f"Headers: {request.headers}")
        except Exception as e:
            logger.error(f"Error in LoggingMixin: {str(e)}", exc_info=True)
        return request

    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)
        logger.info(f"Auth Token: {request.auth}")
        return response