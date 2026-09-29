import { ValidationError } from '@nestjs/common';
import { flattenValidationErrors } from './validation.pipe';

describe('flattenValidationErrors', () => {
  it('flattens nested errors with dotted field paths', () => {
    const errors: ValidationError[] = [
      { property: 'email', constraints: { isEmail: 'email must be an email' }, children: [] },
      {
        property: 'profile',
        children: [
          { property: 'displayName', constraints: { isNotEmpty: 'required' }, children: [] },
        ],
      },
    ];

    expect(flattenValidationErrors(errors)).toEqual([
      { field: 'email', errors: ['email must be an email'] },
      { field: 'profile.displayName', errors: ['required'] },
    ]);
  });
});
