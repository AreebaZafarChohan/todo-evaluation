"""Test script to verify theme functionality"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from todo_cli.service import TodoService
from todo_cli.models import ThemeManager

def test_theme_functionality():
    print("Testing theme functionality...")
    
    # Test ThemeManager
    tm = ThemeManager()
    print(f"Default theme: {tm.get_current_theme_name()}")
    
    # Test switching themes
    themes = ["default", "dark", "light", "colorful"]
    for theme in themes:
        tm.set_theme(theme)
        color = tm.get_color("header_text")
        print(f"Theme: {theme}, Header text color: {color}")
    
    # Test service theme functionality
    service = TodoService()
    print(f"Service initial theme: {service.get_current_theme()}")
    
    # Change theme via service
    service.set_theme("dark")
    print(f"Service theme after change: {service.get_current_theme()}")
    
    # Change back to default
    service.set_theme("default")
    print(f"Service theme after reset: {service.get_current_theme()}")
    
    print("Theme functionality test completed successfully!")

if __name__ == "__main__":
    test_theme_functionality()