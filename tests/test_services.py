import ast
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def test_incident_service_syntax():
    main_file = ROOT / "incident-service" / "app" / "main.py"

    source = main_file.read_text(encoding="utf-8")

    ast.parse(source)


def test_resource_service_syntax():
    main_file = ROOT / "resource-serivice" / "app" / "main.py"

    source = main_file.read_text(encoding="utf-8")

    ast.parse(source)


def test_incident_service_structure():
    app_directory = ROOT / "incident-service" / "app"

    assert app_directory.exists()
    assert (app_directory / "main.py").exists()


def test_resource_service_structure():
    app_directory = ROOT / "resource-serivice" / "app"

    assert app_directory.exists()
    assert (app_directory / "main.py").exists()
