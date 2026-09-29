import { ApiError } from './api-error';
import { getErrorMessage } from './error-messages';

describe('getErrorMessage', () => {
  it('translates known codes', () => {
    expect(getErrorMessage(new ApiError(0, 'NETWORK_ERROR', 'Network request failed'))).toMatch(
      /connexion internet/,
    );
  });

  it('uses a generic server message for unknown 5xx codes', () => {
    expect(getErrorMessage(new ApiError(502, 'HTTP_502', 'x'))).toMatch(/erreur inattendue/);
  });

  it('never exposes raw technical messages', () => {
    const message = getErrorMessage(new Error('TypeError: cannot read property of undefined'));
    expect(message).not.toMatch(/TypeError/);
  });
});
