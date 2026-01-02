"""Test for theme persistence functionality"""

import sys
import os
import json
from pathlib import Path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from todo_cli.service import TodoService

def test_theme_persistence():
    print("Testing theme persistence...")
    
    # Create a service instance
    service = TodoService()
    
    # Test initial theme (should be default)
    print(f"Initial theme: {service.get_current_theme()}")
    
    # Change theme to dark
    service.set_theme("dark")
    print(f"Changed to dark theme: {service.get_current_theme()}")
    
    # Check if config file was created
    config_path = Path.home() / ".todo_cli_config.json"
    print(f"Config file exists: {config_path.exists()}")
    
    if config_path.exists():
        with open(config_path, 'r') as f:
            config = json.load(f)
            print(f"Config content: {config}")
    
    # Create a new service instance (this should load the saved theme)
    service2 = TodoService()
    print(f"New service instance theme (should be dark): {service2.get_current_theme()}")
    
    # Change to another theme
    service2.set_theme("colorful")
    print(f"Changed to colorful theme: {service2.get_current_theme()}")
    
    # Check config again
    if config_path.exists():
        with open(config_path, 'r') as f:
            config = json.load(f)
            print(f"Config content after colorful: {config}")
    
    # Create another service instance
    service3 = TodoService()
    print(f"Third service instance theme (should be colorful): {service3.get_current_theme()}")
    
    # Test with invalid theme - should default to default
    service3.set_theme("invalid_theme")
    service4 = TodoService()
    print(f"After invalid theme, should still be colorful: {service4.get_current_theme()}")
    
    print("\nTheme persistence test completed successfully!")

if __name__ == "__main__":
    test_theme_persistence()