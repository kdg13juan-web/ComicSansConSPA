import { describe, it, expect } from 'vitest';
import { formatMessage, convertToGeminiFormat, isValidMessage } from '../src/utils.js';

describe('formatMessage', () => {
  it('devuelve un objeto con role, content y timestamp', () => {
    const msg = formatMessage('user', 'Hola');
    expect(msg.role).toBe('user');
    expect(msg.content).toBe('Hola');
    expect(typeof msg.timestamp).toBe('number');
  });

  it('el timestamp es un número', () => {
    const msg = formatMessage('character', 'test');
    expect(typeof msg.timestamp).toBe('number');
  });
});

describe('convertToGeminiFormat', () => {
  it('convierte el role "character" a "model"', () => {
    const result = convertToGeminiFormat([{ role: 'character', content: 'Hola' }]);
    expect(result[0].role).toBe('model');
  });

  it('mantiene el role "user" como "user"', () => {
    const result = convertToGeminiFormat([{ role: 'user', content: 'Hola' }]);
    expect(result[0].role).toBe('user');
  });

  it('envuelve el content en parts con clave text', () => {
    const result = convertToGeminiFormat([{ role: 'user', content: 'Hola Tony' }]);
    expect(result[0].parts).toEqual([{ text: 'Hola Tony' }]);
  });
});

describe('isValidMessage', () => {
  it('devuelve false para string vacío', () => {
    expect(isValidMessage('')).toBe(false);
  });

  it('devuelve false para string con solo espacios', () => {
    expect(isValidMessage('   ')).toBe(false);
  });

  it('devuelve true para texto normal', () => {
    expect(isValidMessage('Hola Tony')).toBe(true);
  });
});