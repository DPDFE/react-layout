import { genAutoId, genAutoIdString, genAutoIdInit } from '../src/autoindex';

test('vfcnmjrv0f', () => {
    const target = genAutoIdString();
    expect(typeof target).toBe('string');
});

genAutoIdInit({ start: 1 });

test('genAutoId start 1', () => {
    expect(genAutoId()).toBe(1);
    expect(genAutoId()).toBe(2);
    expect(genAutoId()).toBe(3);
    expect(genAutoId()).toBe(4);
});

test('分组1', () => {
    let target: number = genAutoId('1');

    target++;
    expect(genAutoId('1')).toBe(target);
    target++;
    expect(genAutoId('1')).toBe(target);
    target++;
    expect(genAutoId('1')).toBe(target);
    target++;
    expect(genAutoId('1')).toBe(target);
});

test('分组default', () => {
    let target: number = genAutoId();

    target++;
    expect(genAutoId()).toBe(target);
    target++;
    expect(genAutoId()).toBe(target);
    target++;
    expect(genAutoId()).toBe(target);
    target++;
    expect(genAutoId()).toBe(target);
});
