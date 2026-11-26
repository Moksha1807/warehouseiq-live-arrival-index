/**
 * WarehouseIQ - Core AVL Tree Interval Index
 * Problem Statement 09: "The Warehouse's Broken Number Ranges"
 *
 * Maintains sorted, disjoint, non-adjacent closed intervals [start, end]
 * keyed by `start` in a self-balancing Binary Search Tree (AVL Tree).
 *
 * Time Complexities (k = number of disjoint intervals):
 *  - insertPackageId(id):   O(log k) amortized/worst-case
 *  - containsPackage(id):   O(log k)
 *  - findPredecessor(id):   O(log k)
 *  - findSuccessor(id):     O(log k)
 *  - findMissingRanges:     O(log k + m) where m = overlapping intervals in query range
 *  - Space:                 O(k), independent of maximum package ID magnitude
 */

export class AVLNode {
  constructor(start, end = start) {
    this.start = start;
    this.end = end;
    this.height = 1;
    this.left = null;
    this.right = null;
  }
}

export class IntervalAVLTree {
  constructor() {
    this.root = null;
    this.intervalCount = 0;
    this.uniqueCount = 0;
    this.duplicateCount = 0;
    this.totalArrivals = 0;
    this.mergeCount = 0;
    this.rotationCount = 0;
  }

  _height(node) {
    return node ? node.height : 0;
  }

  _balanceFactor(node) {
    return node ? this._height(node.left) - this._height(node.right) : 0;
  }

  _updateHeight(node) {
    if (!node) return;
    node.height = 1 + Math.max(this._height(node.left), this._height(node.right));
  }

  _rotateRight(y) {
    const x = y.left;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    this._updateHeight(y);
    this._updateHeight(x);
    return x;
  }

  _rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    this._updateHeight(x);
    this._updateHeight(y);
    return y;
  }

  _rebalance(node, rotations) {
    this._updateHeight(node);
    const balance = this._balanceFactor(node);

    // Left Heavy
    if (balance > 1) {
      if (this._balanceFactor(node.left) >= 0) {
        const rotated = this._rotateRight(node);
        rotations.push({
          type: 'LL (Right Rotation)',
          pivotStart: node.start,
          newRootStart: rotated.start,
        });
        this.rotationCount += 1;
        return rotated;
      } else {
        const pivotLeft = node.left.start;
        node.left = this._rotateLeft(node.left);
        const rotated = this._rotateRight(node);
        rotations.push({
          type: 'LR (Left-Right Rotation)',
          pivotStart: node.start,
          secondaryPivot: pivotLeft,
          newRootStart: rotated.start,
        });
        this.rotationCount += 1;
        return rotated;
      }
    }

    // Right Heavy
    if (balance < -1) {
      if (this._balanceFactor(node.right) <= 0) {
        const rotated = this._rotateLeft(node);
        rotations.push({
          type: 'RR (Left Rotation)',
          pivotStart: node.start,
          newRootStart: rotated.start,
        });
        this.rotationCount += 1;
        return rotated;
      } else {
        const pivotRight = node.right.start;
        node.right = this._rotateRight(node.right);
        const rotated = this._rotateLeft(node);
        rotations.push({
          type: 'RL (Right-Left Rotation)',
          pivotStart: node.start,
          secondaryPivot: pivotRight,
          newRootStart: rotated.start,
        });
        this.rotationCount += 1;
        return rotated;
      }
    }

    return node;
  }

  _insertNode(node, start, end, rotations) {
    if (!node) {
      return new AVLNode(start, end);
    }
    if (start < node.start) {
      node.left = this._insertNode(node.left, start, end, rotations);
    } else if (start > node.start) {
      node.right = this._insertNode(node.right, start, end, rotations);
    } else {
      return node;
    }
    return this._rebalance(node, rotations);
  }

  _minValueNode(node) {
    let curr = node;
    while (curr && curr.left) {
      curr = curr.left;
    }
    return curr;
  }

  _deleteNode(node, start, rotations) {
    if (!node) return null;

    if (start < node.start) {
      node.left = this._deleteNode(node.left, start, rotations);
    } else if (start > node.start) {
      node.right = this._deleteNode(node.right, start, rotations);
    } else {
      if (!node.left || !node.right) {
        return node.left || node.right;
      }
      const successor = this._minValueNode(node.right);
      node.start = successor.start;
      node.end = successor.end;
      node.right = this._deleteNode(node.right, successor.start, rotations);
    }

    return this._rebalance(node, rotations);
  }

  /**
   * Finds the node with the largest `start <= id` along with the traversal path.
   */
  findPredecessor(id) {
    let curr = this.root;
    let candidate = null;
    const path = [];

    while (curr) {
      path.push({ start: curr.start, end: curr.end });
      if (curr.start <= id) {
        candidate = curr;
        curr = curr.right;
      } else {
        curr = curr.left;
      }
    }

    return { node: candidate, path };
  }

  /**
   * Finds the node with the smallest `start > id` along with the traversal path.
   */
  findSuccessor(id) {
    let curr = this.root;
    let candidate = null;
    const path = [];

    while (curr) {
      path.push({ start: curr.start, end: curr.end });
      if (curr.start > id) {
        candidate = curr;
        curr = curr.left;
      } else {
        curr = curr.right;
      }
    }

    return { node: candidate, path };
  }

  /**
   * Checks whether a package ID already exists in the AVL index.
   */
  containsPackage(id) {
    const { node: pred, path } = this.findPredecessor(id);
    const found = Boolean(pred && id >= pred.start && id <= pred.end);
    return {
      found,
      interval: found ? { start: pred.start, end: pred.end } : null,
      path,
    };
  }

  /**
   * Returns a sorted array of all disjoint intervals via in-order traversal.
   */
  getIntervals() {
    const result = [];
    const traverse = (node) => {
      if (!node) return;
      traverse(node.left);
      result.push({ start: node.start, end: node.end });
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }

  /**
   * Returns an immutable serialized snapshot of the AVL tree for visualization.
   */
  serializeTree(node = this.root) {
    if (!node) return null;
    return {
      start: node.start,
      end: node.end,
      height: node.height,
      balance: this._balanceFactor(node),
      left: this.serializeTree(node.left),
      right: this.serializeTree(node.right),
    };
  }

  /**
   * Inserts a non-negative integer package ID incrementally into the AVL interval index.
   */
  insertPackageId(rawId) {
    const id = typeof rawId === 'number' ? rawId : Number(rawId);
    if (!Number.isSafeInteger(id) || id < 0) {
      throw new RangeError('Package ID must be a non-negative safe integer.');
    }

    const beforeIntervals = this.getIntervals();
    const beforeTree = this.serializeTree();
    const beforeHeight = this._height(this.root);

    this.totalArrivals += 1;

    const { node: pred, path: predPath } = this.findPredecessor(id);
    const { node: succ, path: succPath } = this.findSuccessor(id);

    const predSnap = pred ? { start: pred.start, end: pred.end } : null;
    const succSnap = succ ? { start: succ.start, end: succ.end } : null;
    const rotations = [];
    const steps = [];

    steps.push({
      title: '1. Predecessor Lookup',
      detail: predSnap
        ? `Visited ${predPath.length} node(s) in AVL tree. Largest interval with start <= ${id} is [${predSnap.start}–${predSnap.end}].`
        : `Visited ${predPath.length} node(s). No interval exists with start <= ${id}.`,
    });

    // Case 1: Duplicate check
    if (pred && id <= pred.end) {
      this.duplicateCount += 1;
      steps.push({
        title: '2. Duplicate Detected',
        detail: `Package ID ${id} already falls inside [${pred.start}–${pred.end}]. Tree remains unchanged.`,
      });

      return {
        id,
        action: 'DUPLICATE',
        actionLabel: 'Duplicate Ignored',
        beforeIntervals,
        afterIntervals: beforeIntervals,
        beforeTree,
        afterTree: beforeTree,
        beforeHeight,
        afterHeight: beforeHeight,
        pred: predSnap,
        succ: succSnap,
        predPath,
        succPath,
        rotations,
        affectedInterval: predSnap,
        mergedFrom: null,
        nodeCount: this.intervalCount,
        uniqueCount: this.uniqueCount,
        duplicateCount: this.duplicateCount,
        totalArrivals: this.totalArrivals,
        steps,
      };
    }

    steps.push({
      title: '2. Successor Lookup',
      detail: succSnap
        ? `Visited ${succPath.length} node(s). Smallest interval with start > ${id} is [${succSnap.start}–${succSnap.end}].`
        : `Visited ${succPath.length} node(s). No interval exists with start > ${id}.`,
    });

    const touchesPred = Boolean(pred && pred.end + 1 === id);
    const touchesSucc = Boolean(succ && id + 1 === succ.start);

    let action;
    let actionLabel;
    let affectedInterval;
    let mergedFrom = null;

    if (touchesPred && touchesSucc) {
      // Case 2: Bridge & Merge two intervals
      action = 'MERGE';
      actionLabel = 'Intervals Merged';
      mergedFrom = [predSnap, succSnap];
      const mergedEnd = succ.end;
      const succStartToDelete = succ.start;

      pred.end = mergedEnd;
      this.root = this._deleteNode(this.root, succStartToDelete, rotations);
      this.intervalCount -= 1;
      this.uniqueCount += 1;
      this.mergeCount += 1;
      affectedInterval = { start: predSnap.start, end: mergedEnd };

      steps.push({
        title: '3. Adjacency Check (Both Sides)',
        detail: `${id} connects [${predSnap.start}–${predSnap.end}] (end + 1 = ${id}) and [${succSnap.start}–${succSnap.end}] (start - 1 = ${id}).`,
      });
      steps.push({
        title: '4. Merge & AVL Rebalance',
        detail: `Extended predecessor to [${affectedInterval.start}–${affectedInterval.end}] and deleted successor node [${succSnap.start}–${succSnap.end}].${
          rotations.length
            ? ` Performed ${rotations.map((r) => r.type).join(', ')}.`
            : ' AVL balance preserved.'
        }`,
      });
    } else if (touchesPred) {
      // Case 3: Extend predecessor right
      action = 'EXTEND_RIGHT';
      actionLabel = 'Extended Right';
      pred.end = id;
      this.uniqueCount += 1;
      affectedInterval = { start: pred.start, end: id };

      steps.push({
        title: '3. Adjacency Check (Left Neighbor)',
        detail: `Predecessor [${predSnap.start}–${predSnap.end}] ends at ${predSnap.end}, which is adjacent to ${id}.`,
      });
      steps.push({
        title: '4. In-Place Extension',
        detail: `Updated predecessor end boundary to [${affectedInterval.start}–${affectedInterval.end}]. Key \`start\` unchanged; O(1) update after lookup.`,
      });
    } else if (touchesSucc) {
      // Case 4: Extend successor left
      action = 'EXTEND_LEFT';
      actionLabel = 'Extended Left';
      // Updating succ.start = id preserves BST ordering because pred.end < id - 1 < id < succ.start
      succ.start = id;
      this.uniqueCount += 1;
      affectedInterval = { start: id, end: succ.end };

      steps.push({
        title: '3. Adjacency Check (Right Neighbor)',
        detail: `Successor [${succSnap.start}–${succSnap.end}] starts at ${succSnap.start}, which is adjacent to ${id}.`,
      });
      steps.push({
        title: '4. Boundary Shift',
        detail: `Shifted successor start boundary from ${succSnap.start} to ${id}, yielding [${affectedInterval.start}–${affectedInterval.end}] while preserving strict BST order.`,
      });
    } else {
      // Case 5: Isolated new interval node
      action = 'INSERT_NEW';
      actionLabel = 'New Interval Created';
      this.root = this._insertNode(this.root, id, id, rotations);
      this.intervalCount += 1;
      this.uniqueCount += 1;
      affectedInterval = { start: id, end: id };

      steps.push({
        title: '3. Adjacency Check (Isolated)',
        detail: `Package ID ${id} is not adjacent to any predecessor or successor interval.`,
      });
      steps.push({
        title: '4. AVL Node Insertion',
        detail: `Inserted new leaf node [${id}–${id}] into the AVL tree.${
          rotations.length
            ? ` Rebalanced via ${rotations.map((r) => `${r.type} at ${r.pivotStart}`).join(', ')}.`
            : ' Tree remained height-balanced.'
        }`,
      });
    }

    const afterIntervals = this.getIntervals();
    const afterTree = this.serializeTree();
    const afterHeight = this._height(this.root);

    return {
      id,
      action,
      actionLabel,
      beforeIntervals,
      afterIntervals,
      beforeTree,
      afterTree,
      beforeHeight,
      afterHeight,
      pred: predSnap,
      succ: succSnap,
      predPath,
      succPath,
      rotations,
      affectedInterval,
      mergedFrom,
      nodeCount: this.intervalCount,
      uniqueCount: this.uniqueCount,
      duplicateCount: this.duplicateCount,
      totalArrivals: this.totalArrivals,
      steps,
    };
  }

  /**
   * Pruned AVL range query collecting all intervals overlapping [rangeStart, rangeEnd] in O(log k + m).
   */
  findOverlappingIntervals(rangeStart, rangeEnd) {
    if (rangeStart > rangeEnd) {
      throw new RangeError('Start ID must be less than or equal to End ID.');
    }

    const overlapping = [];
    const visitedNodes = [];
    let prunedSubtrees = 0;

    const search = (node) => {
      if (!node) return;
      visitedNodes.push({ start: node.start, end: node.end });

      // Since all intervals in left subtree have end < node.start <= node.end,
      // if node.end < rangeStart, we can safely prune the entire left subtree?
      // Wait: if node.start > rangeStart, left subtree might overlap [rangeStart, rangeEnd].
      // Specifically: left subtree can contain intervals overlapping >= rangeStart ONLY IF node.start > rangeStart.
      // Better: left subtree has max end < node.start. So if node.start <= rangeStart, left subtree has all ends < rangeStart => prune left!
      if (node.left) {
        if (node.start > rangeStart) {
          search(node.left);
        } else {
          prunedSubtrees += 1;
        }
      }

      if (node.end >= rangeStart && node.start <= rangeEnd) {
        overlapping.push({ start: node.start, end: node.end });
      }

      // Right subtree has all starts > node.end. So if node.end >= rangeEnd, right subtree has all starts > rangeEnd => prune right!
      if (node.right) {
        if (node.end < rangeEnd) {
          search(node.right);
        } else {
          prunedSubtrees += 1;
        }
      }
    };

    search(this.root);
    return { overlapping, visitedNodes, prunedSubtrees };
  }

  /**
   * Computes missing package intervals within [rangeStart, rangeEnd] without iterating ID-by-ID.
   */
  findMissingRanges(rangeStart, rangeEnd) {
    if (!Number.isSafeInteger(rangeStart) || !Number.isSafeInteger(rangeEnd) || rangeStart < 0 || rangeEnd < 0) {
      throw new RangeError('Range bounds must be non-negative safe integers.');
    }
    if (rangeStart > rangeEnd) {
      throw new RangeError('Starting Package ID must be less than or equal to Ending Package ID.');
    }

    const { overlapping, visitedNodes, prunedSubtrees } = this.findOverlappingIntervals(rangeStart, rangeEnd);
    const missingRanges = [];
    const clampedIntervals = [];

    let cursor = rangeStart;
    let receivedInRange = 0;

    for (const iv of overlapping) {
      const clampedStart = Math.max(iv.start, rangeStart);
      const clampedEnd = Math.min(iv.end, rangeEnd);
      if (clampedStart <= clampedEnd) {
        clampedIntervals.push({ start: clampedStart, end: clampedEnd });
        receivedInRange += clampedEnd - clampedStart + 1;
      }

      if (iv.start > cursor) {
        missingRanges.push({
          start: cursor,
          end: Math.min(iv.start - 1, rangeEnd),
        });
      }
      cursor = Math.max(cursor, iv.end + 1);
    }

    if (cursor <= rangeEnd) {
      missingRanges.push({
        start: cursor,
        end: rangeEnd,
      });
    }

    const totalInRange = rangeEnd - rangeStart + 1;
    const missingInRange = totalInRange - receivedInRange;
    const coveragePercent = totalInRange > 0 ? Number(((receivedInRange / totalInRange) * 100).toFixed(2)) : 0;

    return {
      rangeStart,
      rangeEnd,
      overlappingIntervals: overlapping,
      clampedIntervals,
      missingRanges,
      totalInRange,
      receivedInRange,
      missingInRange,
      coveragePercent,
      visitedNodes,
      prunedSubtrees,
    };
  }

  /**
   * Computes global span [min, max] and missing packages inside [min, max].
   */
  getGlobalStats() {
    if (!this.root) {
      return {
        minId: null,
        maxId: null,
        totalIntervals: 0,
        uniqueCount: 0,
        duplicateCount: this.duplicateCount,
        totalArrivals: this.totalArrivals,
        missingWithinSpan: 0,
        missingSpanRanges: [],
        treeHeight: 0,
        mergeCount: this.mergeCount,
        rotationCount: this.rotationCount,
      };
    }

    let minNode = this.root;
    while (minNode.left) minNode = minNode.left;
    let maxNode = this.root;
    while (maxNode.right) maxNode = maxNode.right;

    const minId = minNode.start;
    const maxId = maxNode.end;
    const spanResult = this.findMissingRanges(minId, maxId);

    return {
      minId,
      maxId,
      totalIntervals: this.intervalCount,
      uniqueCount: this.uniqueCount,
      duplicateCount: this.duplicateCount,
      totalArrivals: this.totalArrivals,
      missingWithinSpan: spanResult.missingInRange,
      missingSpanRanges: spanResult.missingRanges,
      treeHeight: this._height(this.root),
      mergeCount: this.mergeCount,
      rotationCount: this.rotationCount,
    };
  }

  /**
   * Verifies all AVL and interval-disjointness invariants (used by test suite & diagnostics).
   */
  verifyInvariants() {
    const intervals = [];
    let countedUnique = 0;

    const validate = (node) => {
      if (!node) return 0;
      if (node.start > node.end) {
        throw new Error(`Invalid interval [${node.start}, ${node.end}]`);
      }
      const leftH = validate(node.left);
      intervals.push({ start: node.start, end: node.end });
      countedUnique += node.end - node.start + 1;
      const rightH = validate(node.right);

      const expectedHeight = 1 + Math.max(leftH, rightH);
      if (node.height !== expectedHeight) {
        throw new Error(`Height mismatch at node ${node.start}: got ${node.height}, expected ${expectedHeight}`);
      }
      const bf = leftH - rightH;
      if (Math.abs(bf) > 1) {
        throw new Error(`AVL balance violated at node ${node.start}: balanceFactor=${bf}`);
      }
      return expectedHeight;
    };

    validate(this.root);

    for (let i = 1; i < intervals.length; i += 1) {
      if (intervals[i - 1].end + 1 >= intervals[i].start) {
        throw new Error(
          `Intervals not strictly separated: [${intervals[i - 1].start}-${intervals[i - 1].end}] and [${intervals[i].start}-${intervals[i].end}]`
        );
      }
    }

    if (intervals.length !== this.intervalCount) {
      throw new Error(`Interval count mismatch: ${this.intervalCount} vs ${intervals.length}`);
    }
    if (countedUnique !== this.uniqueCount) {
      throw new Error(`Unique count mismatch: ${this.uniqueCount} vs ${countedUnique}`);
    }

    return true;
  }
}
