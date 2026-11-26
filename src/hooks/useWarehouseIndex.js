import { useState, useRef, useCallback, useEffect } from 'react';
import { IntervalAVLTree } from '../engine/avlIntervalTree';
import { INITIAL_SAMPLE_ARRIVALS } from '../data/sampleData';
import { parsePackageId, parseBatchIds } from '../utils/formatters';

function buildSampleState() {
  const tree = new IntervalAVLTree();
  const history = [];
  let lastTrace = null;

  INITIAL_SAMPLE_ARRIVALS.forEach((id, idx) => {
    const trace = tree.insertPackageId(id);
    lastTrace = trace;
    history.unshift({
      seq: idx + 1,
      id,
      action: trace.action,
      actionLabel: trace.actionLabel,
      affectedInterval: trace.affectedInterval,
      mergedFrom: trace.mergedFrom,
      intervalCount: trace.nodeCount,
      uniqueCount: trace.uniqueCount,
      duplicateCount: trace.duplicateCount,
      timestamp: new Date(Date.now() - (INITIAL_SAMPLE_ARRIVALS.length - idx) * 4500),
    });
  });

  return { tree, history, lastTrace };
}

export function useWarehouseIndex() {
  const initialRef = useRef(null);
  if (!initialRef.current) {
    initialRef.current = buildSampleState();
  }

  const treeRef = useRef(initialRef.current.tree);
  const seqRef = useRef(initialRef.current.history.length);

  const [intervals, setIntervals] = useState(() => treeRef.current.getIntervals());
  const [treeSnapshot, setTreeSnapshot] = useState(() => treeRef.current.serializeTree());
  const [stats, setStats] = useState(() => treeRef.current.getGlobalStats());
  const [history, setHistory] = useState(() => initialRef.current.history);
  const [lastTrace, setLastTrace] = useState(() => initialRef.current.lastTrace);
  const [notification, setNotification] = useState(null);
  const [isAutoStreaming, setIsAutoStreaming] = useState(false);

  const syncFromTree = useCallback(() => {
    setIntervals(treeRef.current.getIntervals());
    setTreeSnapshot(treeRef.current.serializeTree());
    setStats(treeRef.current.getGlobalStats());
  }, []);

  const pushNotification = useCallback((trace) => {
    const type =
      trace.action === 'DUPLICATE'
        ? 'warning'
        : trace.action === 'MERGE'
          ? 'merge'
          : 'success';
    setNotification({
      id: Date.now() + Math.random(),
      type,
      action: trace.action,
      actionLabel: trace.actionLabel,
      packageId: trace.id,
      affectedInterval: trace.affectedInterval,
      mergedFrom: trace.mergedFrom,
    });
  }, []);

  const addPackage = useCallback(
    (rawId, { silent = false } = {}) => {
      const parsed = parsePackageId(rawId);
      if (!parsed.valid) {
        if (!silent) {
          setNotification({
            id: Date.now(),
            type: 'error',
            action: 'ERROR',
            actionLabel: 'Invalid Input',
            message: parsed.error,
          });
        }
        return { ok: false, error: parsed.error };
      }

      const trace = treeRef.current.insertPackageId(parsed.value);
      seqRef.current += 1;

      const entry = {
        seq: seqRef.current,
        id: trace.id,
        action: trace.action,
        actionLabel: trace.actionLabel,
        affectedInterval: trace.affectedInterval,
        mergedFrom: trace.mergedFrom,
        intervalCount: trace.nodeCount,
        uniqueCount: trace.uniqueCount,
        duplicateCount: trace.duplicateCount,
        timestamp: new Date(),
      };

      setHistory((prev) => [entry, ...prev].slice(0, 200));
      setLastTrace(trace);
      syncFromTree();

      if (!silent) {
        pushNotification(trace);
      }

      return { ok: true, trace };
    },
    [pushNotification, syncFromTree]
  );

  const addBatchPackages = useCallback(
    (rawText) => {
      const parsed = parseBatchIds(rawText);
      if (!parsed.valid) {
        setNotification({
          id: Date.now(),
          type: 'error',
          action: 'ERROR',
          actionLabel: 'Batch Error',
          message: parsed.error,
        });
        return { ok: false, error: parsed.error };
      }

      let lastResult = null;
      const newEntries = [];
      let merges = 0;
      let dupes = 0;

      for (const id of parsed.ids) {
        const trace = treeRef.current.insertPackageId(id);
        seqRef.current += 1;
        lastResult = trace;
        if (trace.action === 'MERGE') merges += 1;
        if (trace.action === 'DUPLICATE') dupes += 1;

        newEntries.unshift({
          seq: seqRef.current,
          id: trace.id,
          action: trace.action,
          actionLabel: trace.actionLabel,
          affectedInterval: trace.affectedInterval,
          mergedFrom: trace.mergedFrom,
          intervalCount: trace.nodeCount,
          uniqueCount: trace.uniqueCount,
          duplicateCount: trace.duplicateCount,
          timestamp: new Date(),
        });
      }

      setHistory((prev) => [...newEntries, ...prev].slice(0, 200));
      setLastTrace(lastResult);
      syncFromTree();
      setNotification({
        id: Date.now(),
        type: merges > 0 ? 'merge' : 'success',
        action: 'BATCH',
        actionLabel: 'Batch Processed',
        message: `Processed ${parsed.ids.length} ID(s): ${merges} merge(s), ${dupes} duplicate(s).`,
      });

      return { ok: true, count: parsed.ids.length, lastTrace: lastResult };
    },
    [syncFromTree]
  );

  const addRandomArrival = useCallback(
    (minRange = 1, maxRange = 40) => {
      const lo = Math.max(0, Number(minRange) || 0);
      const hi = Math.max(lo, Number(maxRange) || 40);
      const randomId = Math.floor(Math.random() * (hi - lo + 1)) + lo;
      return addPackage(randomId);
    },
    [addPackage]
  );

  const loadSequence = useCallback(
    (ids, label = 'Preset Loaded') => {
      setIsAutoStreaming(false);
      treeRef.current = new IntervalAVLTree();
      seqRef.current = 0;
      const newHistory = [];
      let last = null;

      for (const id of ids) {
        const trace = treeRef.current.insertPackageId(id);
        seqRef.current += 1;
        last = trace;
        newHistory.unshift({
          seq: seqRef.current,
          id: trace.id,
          action: trace.action,
          actionLabel: trace.actionLabel,
          affectedInterval: trace.affectedInterval,
          mergedFrom: trace.mergedFrom,
          intervalCount: trace.nodeCount,
          uniqueCount: trace.uniqueCount,
          duplicateCount: trace.duplicateCount,
          timestamp: new Date(),
        });
      }

      setHistory(newHistory);
      setLastTrace(last);
      syncFromTree();
      setNotification({
        id: Date.now(),
        type: 'success',
        action: 'LOAD',
        actionLabel: label,
        message: `Loaded ${ids.length} package arrival(s) into a fresh AVL Index.`,
      });
    },
    [syncFromTree]
  );

  const resetIndex = useCallback(() => {
    setIsAutoStreaming(false);
    treeRef.current = new IntervalAVLTree();
    seqRef.current = 0;
    setHistory([]);
    setLastTrace(null);
    syncFromTree();
    setNotification({
      id: Date.now(),
      type: 'info',
      action: 'RESET',
      actionLabel: 'Index Cleared',
      message: 'All intervals, AVL nodes, and arrival history have been reset.',
    });
  }, [syncFromTree]);

  const restoreSampleData = useCallback(() => {
    loadSequence(INITIAL_SAMPLE_ARRIVALS, 'Sample Dataset Restored');
  }, [loadSequence]);

  const findMissingRanges = useCallback((startId, endId) => {
    return treeRef.current.findMissingRanges(startId, endId);
  }, []);

  const containsPackage = useCallback((id) => {
    return treeRef.current.containsPackage(id);
  }, []);

  useEffect(() => {
    if (!isAutoStreaming) return undefined;
    const timer = setInterval(() => {
      addRandomArrival(1, 50);
    }, 1400);
    return () => clearInterval(timer);
  }, [isAutoStreaming, addRandomArrival]);

  return {
    intervals,
    treeSnapshot,
    stats,
    history,
    lastTrace,
    notification,
    setNotification,
    isAutoStreaming,
    setIsAutoStreaming,
    addPackage,
    addBatchPackages,
    addRandomArrival,
    loadSequence,
    resetIndex,
    restoreSampleData,
    findMissingRanges,
    containsPackage,
  };
}
