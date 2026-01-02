"""Comprehensive test for theme functionality"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from todo_cli.service import TodoService
from todo_cli.models import ThemeManager

def test_theme_colors():
    print("Testing theme colors...")
    
    # Test ThemeManager
    tm = ThemeManager()
    
    # Test switching themes and getting colors
    themes = ["default", "dark", "light", "colorful"]
    elements = ["header_text", "menu_option", "success", "error", "border"]
    
    for theme in themes:
        print(f"\n--- Testing {theme} theme ---")
        tm.set_theme(theme)
        for element in elements:
            color = tm.get_color(element)
            print(f"  {element}: '{repr(color)}'")  # Using repr to see the actual escape codes
    
    # Test service integration
    print(f"\n--- Testing service integration ---")
    service = TodoService()
    print(f"Initial theme: {service.get_current_theme()}")
    
    # Change theme via service
    service.set_theme("dark")
    print(f"After setting to dark: {service.get_current_theme()}")
    
    # Verify the theme manager in service is updated
    from todo_cli.service import theme_manager
    print(f"Service theme manager theme: {theme_manager.get_current_theme_name()}")
    
    # Change to another theme
    service.set_theme("colorful")
    print(f"After setting to colorful: {service.get_current_theme()}")
    print(f"Service theme manager theme: {theme_manager.get_current_theme_name()}")
    
    # Test with invalid theme (should default to default)
    service.set_theme("invalid_theme")
    print(f"After setting to invalid theme: {service.get_current_theme()}")
    
    print("\nTheme functionality test completed successfully!")

if __name__ == "__main__":
    test_theme_colors()