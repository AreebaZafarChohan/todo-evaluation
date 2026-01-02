"""Comprehensive test for the entire theme functionality"""

import sys
import os
import json
from pathlib import Path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from todo_cli.service import TodoService
from todo_cli.ui import display_header, display_tasks, show_menu
from todo_cli.models import Task, TaskStatus, TaskPriority, TaskCategory, ThemeManager

def test_comprehensive_theme_functionality():
    print("=== Comprehensive Theme Functionality Test ===\n")
    
    # 1. Test ThemeManager directly
    print("1. Testing ThemeManager...")
    tm = ThemeManager()
    print(f"   Initial theme: {tm.get_current_theme_name()}")
    
    # Test all themes
    themes = ["default", "dark", "light", "colorful"]
    for theme in themes:
        tm.set_theme(theme)
        assert tm.get_current_theme_name() == theme, f"Failed to set {theme} theme"
        header_color = tm.get_color("header_text")
        assert header_color != "", f"No color defined for header_text in {theme} theme"
        print(f"   ✓ {theme} theme set and has header color")
    
    print("   ✓ All themes working correctly\n")
    
    # 2. Test Service integration
    print("2. Testing Service integration...")
    service = TodoService()
    initial_theme = service.get_current_theme()
    print(f"   Initial service theme: {initial_theme}")
    
    # Change theme via service
    service.set_theme("dark")
    assert service.get_current_theme() == "dark", "Failed to change theme via service"
    print("   ✓ Theme change via service works")
    
    # Check that the global theme manager was updated
    from todo_cli.service import theme_manager as global_theme_manager
    assert global_theme_manager.get_current_theme_name() == "dark", "Global theme manager not updated"
    print("   ✓ Global theme manager updated correctly")
    
    # Test persistence
    config_path = Path.home() / ".todo_cli_config.json"
    assert config_path.exists(), "Config file not created"
    with open(config_path, 'r') as f:
        config = json.load(f)
        assert config.get('theme') == 'dark', "Theme not saved to config"
    print("   ✓ Theme persistence works")
    
    # Create new service and verify it loads the saved theme
    service2 = TodoService()
    assert service2.get_current_theme() == "dark", "Saved theme not loaded on new service instance"
    print("   ✓ Saved theme loaded on new service instance")
    
    # Reset to default
    service2.set_theme("default")
    print("   ✓ Service integration test completed\n")
    
    # 3. Test UI functions use theme colors
    print("3. Testing UI functions...")
    # This is harder to test directly without running the UI, but we can verify
    # that the functions exist and don't throw errors
    try:
        display_header()
        print("   ✓ display_header() works with themes")
    except Exception as e:
        print(f"   ✗ display_header() failed: {e}")
        raise
    
    # Test with a simple task list
    try:
        empty_tasks = []
        display_tasks(empty_tasks)
        print("   ✓ display_tasks() works with themes")
    except Exception as e:
        print(f"   ✗ display_tasks() failed: {e}")
        raise
    
    try:
        show_menu()
        print("   ✓ show_menu() works with themes")
    except Exception as e:
        print(f"   ✗ show_menu() failed: {e}")
        raise
    
    print("   ✓ UI functions test completed\n")
    
    # 4. Test edge cases
    print("4. Testing edge cases...")
    
    # Test invalid theme - should default to default
    service.set_theme("invalid_theme")
    assert service.get_current_theme() == "default", "Invalid theme should default to default"
    print("   ✓ Invalid theme defaults to default")
    
    # Test all valid themes
    for theme in themes:
        service.set_theme(theme)
        assert service.get_current_theme() == theme, f"Failed to set {theme}"
    print("   ✓ All valid themes work")
    
    print("   ✓ Edge cases test completed\n")
    
    # 5. Final verification
    print("5. Final verification...")
    service.set_theme("colorful")
    final_theme = service.get_current_theme()
    assert final_theme == "colorful", "Final theme verification failed"
    
    # Verify config file has the final theme
    with open(config_path, 'r') as f:
        config = json.load(f)
        assert config.get('theme') == 'colorful', "Final theme not saved to config"
    
    print(f"   ✓ Final theme is {final_theme} and saved to config")
    print("\n=== All tests passed! Theme functionality is working correctly ===")

if __name__ == "__main__":
    test_comprehensive_theme_functionality()