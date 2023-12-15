import VersionManager from '../src/version/index';

test('version', () => {
    const target = new VersionManager();
    expect(typeof target).toBe('string');
});
