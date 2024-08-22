from elasticsearch import Elasticsearch

def get_elasticsearch_client():
    es = Elasticsearch(
        "https://localhost:9200",
        basic_auth=("elastic", "Yu0Mdd3ugAnvqIq8cIhN"),  # Replace with actual credentials
        verify_certs=False  # Only for development
    )
    return es