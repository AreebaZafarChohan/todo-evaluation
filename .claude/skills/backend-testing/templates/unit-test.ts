import { describe, it, expect, vi } from 'vitest';
import { {{FunctionName}} } from '../src/{{module}}';

describe('{{ModuleName}}', () => {
  it('should return expected output when input is valid', () => {
    // Arrange
    const input = {{mockInput}};
    const mockDependency = vi.fn();

    // Act
    const result = {{FunctionName}}(input, mockDependency);

    // Assert
    expect(result).toEqual({{expectedOutput}});
    expect(mockDependency).toHaveBeenCalledWith({{expectedDependencyCall}});
  });

  it('should throw error when input is invalid', () => {
    // Arrange
    const invalidInput = {{invalidInput}};

    // Act & Assert
    expect(() => {{FunctionName}}(invalidInput)).toThrow('{{errorMessage}}');
  });
});
