import { describe, it, expect } from 'vitest';
import { IntervalAVLTree } from './avlIntervalTree';
import { BUILT_IN_TEST_CASES } from '../data/sampleData';

describe('IntervalAVLTree — Core Problem Statement 09 Verification', () => {
  it('passes all 6 built-in test cases', () => {
    for (const tc of BUILT_IN_TEST_CASES) {
      const tree = new IntervalAVLTree();
      for (const id of tc.arrivals) {
        tree.insertPackageId(id);
        tree.verifyInvariants();
      }
      for (const id of tc.followUp) {
        tree.insertPackageId(id);
        tree.verifyInvariants();
      }
      expect(tree.getIntervals(), tc.name).toEqual(tc.expectedIntervals);
      expect(tree.duplicateCount, tc.name).toBe(tc.expectedDuplicates);
    }
  });

  it('detects missing ranges accurately including edge bounds and sparse IDs', () => {
    const tree = new IntervalAVLTree();
    [1, 3, 7, 2, 6].forEach((id) => tree.insertPackageId(id));

    const res1 = tree.findMissingRanges(1, 7);
    expect(res1.missingRanges).toEqual([{ start: 4, end: 5 }]);
    expect(res1.overlappingIntervals).toEqual([
      { start: 1, end: 3 },
      { start: 6, end: 7 },
    ]);
    expect(res1.missingInRange).toBe(2);

    const res2 = tree.findMissingRanges(0, 10);
    expect(res2.missingRanges).toEqual([
      { start: 0, end: 0 },
      { start: 4, end: 5 },
      { start: 8, end: 10 },
    ]);

    tree.insertPackageId(1000000);
    const resSparse = tree.findMissingRanges(1, 1000000);
    expect(resSparse.missingRanges).toEqual([
      { start: 4, end: 5 },
      { start: 8, end: 999999 },
    ]);
    expect(resSparse.receivedInRange).toBe(6);
  });

  it('maintains strict AVL balance across ascending, descending, and merging insertions', () => {
    const tree = new IntervalAVLTree();

    // Ascending isolated keys (every key separated by 2) triggers RR rotations
    for (let i = 0; i < 60; i += 2) {
      tree.insertPackageId(i);
      tree.verifyInvariants();
    }
    expect(tree.intervalCount).toBe(30);
    expect(tree.getGlobalStats().treeHeight).toBeLessThanOrEqual(6);

    // Descending isolated keys triggers LL rotations
    for (let i = 200; i >= 120; i -= 2) {
      tree.insertPackageId(i);
      tree.verifyInvariants();
    }

    // Bridge every gap in random order to trigger AVL deletions & merges
    const bridges = [];
    for (let i = 1; i < 58; i += 2) bridges.push(i);
    for (let i = 121; i < 200; i += 2) bridges.push(i);
    bridges.reverse();

    for (const b of bridges) {
      const trace = tree.insertPackageId(b);
      expect(trace.action).toBe('MERGE');
      tree.verifyInvariants();
    }

    expect(tree.getIntervals()).toEqual([
      { start: 0, end: 58 },
      { start: 120, end: 200 },
    ]);
  });

  it('handles 0 and large safe integers cleanly', () => {
    const tree = new IntervalAVLTree();
    tree.insertPackageId(0);
    tree.insertPackageId(10000000000);
    tree.insertPackageId(9999999999);
    tree.verifyInvariants();
    expect(tree.getIntervals()).toEqual([
      { start: 0, end: 0 },
      { start: 9999999999, end: 10000000000 },
    ]);
  });

  it('rejects negative or non-integer IDs', () => {
    const tree = new IntervalAVLTree();
    expect(() => tree.insertPackageId(-1)).toThrow();
    expect(() => tree.insertPackageId(3.5)).toThrow();
  });
});
