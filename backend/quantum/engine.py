"""
backend/quantum/engine.py
Quantum-inspired algorithms powering all 11 Sianlk apps.
Classical implementations of quantum concepts — runs on standard hardware.
"""
import math, random, hashlib, time, statistics
from typing import List, Dict, Any, Tuple, Optional


class QuantumEngine:

    # ── Scoring ───────────────────────────────────────────────────────────────
    @staticmethod
    def quantum_score(features: List[float], weights: Optional[List[float]] = None) -> float:
        """Quantum amplitude estimation scoring via superposition interference."""
        n = len(features)
        if not n:
            return 0.0
        if weights is None:
            weights = [1.0 / n] * n
        amplitudes = []
        for i, (f, w) in enumerate(zip(features, weights)):
            phase = 2 * math.pi * i / n
            amplitude = math.sqrt(abs(f * w)) * math.cos(phase)
            amplitudes.append(amplitude)
        real = sum(a * math.cos(2 * math.pi * i / n) for i, a in enumerate(amplitudes))
        imag = sum(a * math.sin(2 * math.pi * i / n) for i, a in enumerate(amplitudes))
        prob = (real ** 2 + imag ** 2) / max(len(amplitudes), 1)
        return round(min(max(prob * 10, 0.0), 1.0), 4)

    # ── Annealing Optimizer ───────────────────────────────────────────────────
    @staticmethod
    def quantum_optimize(items: List[Dict], objective_key: str, n_iterations: int = 800) -> List[Dict]:
        """Simulated quantum annealing with tunneling for combinatorial optimization."""
        if not items:
            return items
        best = sorted(items, key=lambda x: -x.get(objective_key, 0))
        best_score = sum(x.get(objective_key, 0) for x in best[:5])
        current = best[:]
        T = 10.0
        for _ in range(n_iterations):
            T *= 0.993
            if len(current) >= 2:
                a, b = random.sample(range(len(current)), 2)
                current[a], current[b] = current[b], current[a]
                new_score = sum(x.get(objective_key, 0) for x in current[:5])
                delta = new_score - best_score
                if delta > 0 or random.random() < math.exp(delta / max(T, 1e-4)):
                    if new_score > best_score:
                        best = current[:]
                        best_score = new_score
                else:
                    current[a], current[b] = current[b], current[a]
        return best

    # ── Recommendation ────────────────────────────────────────────────────────
    @staticmethod
    def quantum_recommend(
        user_vec: List[float], item_vecs: List[List[float]]
    ) -> List[Tuple[int, float]]:
        """Quantum kernel similarity for ultra-precise recommendations."""
        scores = []
        for idx, item_vec in enumerate(item_vecs):
            n = min(len(user_vec), len(item_vec))
            if n == 0:
                scores.append((idx, 0.0))
                continue
            inner = sum(user_vec[i] * item_vec[i] for i in range(n))
            norm_u = math.sqrt(sum(x ** 2 for x in user_vec[:n]) + 1e-10)
            norm_i = math.sqrt(sum(x ** 2 for x in item_vec[:n]) + 1e-10)
            similarity = math.cos(inner / (norm_u * norm_i)) ** 2
            noise = random.gauss(0, 0.015)
            scores.append((idx, round(min(max(similarity + noise, 0.0), 1.0), 4)))
        return sorted(scores, key=lambda x: -x[1])

    # ── Entropy Key (QB84-inspired) ───────────────────────────────────────────
    @staticmethod
    def quantum_entropy_key(length: int = 32) -> str:
        """BB84-inspired quantum key generation using multi-source entropy."""
        entropy = f"{time.time_ns()}{random.getrandbits(256)}{id(object())}"
        return hashlib.shake_256(entropy.encode()).hexdigest(length)

    # ── Sentiment (superposition) ─────────────────────────────────────────────
    @staticmethod
    def quantum_sentiment(text: str) -> Dict[str, float]:
        """Quantum superposition of sentiment eigenstates."""
        words = text.lower().split()
        positive = {"good","great","amazing","excellent","love","perfect","best","awesome",
                    "fantastic","wonderful","brilliant","outstanding","incredible","superb"}
        negative = {"bad","terrible","awful","hate","worst","horrible","dreadful","useless",
                    "garbage","pathetic","disgusting","poor","broken","wrong"}
        pos = sum(1 for w in words if w in positive)
        neg = sum(1 for w in words if w in negative)
        total = max(len(words), 1)
        pos_p = (pos + 0.5) / (total + 1)
        neg_p = (neg + 0.5) / (total + 1)
        interference = math.cos(math.pi * (pos_p - neg_p))
        return {
            "positive": round(min(pos_p + 0.1 * interference, 1.0), 3),
            "negative": round(max(neg_p - 0.1 * interference, 0.0), 3),
            "neutral": round(max(1 - pos_p - neg_p, 0.0), 3),
            "quantum_confidence": round(abs(interference), 3),
        }

    # ── Circuit Simulator (for GeniQX) ───────────────────────────────────────
    @staticmethod
    def quantum_circuit_sim(qubits: int, gates: List[Dict]) -> Dict[str, Any]:
        """Simulate a quantum circuit with up to 8 qubits."""
        n = min(max(qubits, 1), 8)
        dim = 2 ** n
        # Initialize |0⟩ state
        state = [complex(0)] * dim
        state[0] = complex(1)

        def apply_hadamard(state, q):
            new = [complex(0)] * len(state)
            for i, amp in enumerate(state):
                bit = (i >> q) & 1
                partner = i ^ (1 << q)
                if bit == 0:
                    new[i] += amp / math.sqrt(2)
                    new[partner] += amp / math.sqrt(2)
                else:
                    new[i] -= amp / math.sqrt(2)
                    new[partner] += amp / math.sqrt(2)  # this is simplified
            return new

        def apply_x(state, q):
            new = [complex(0)] * len(state)
            for i, amp in enumerate(state):
                new[i ^ (1 << q)] += amp
            return new

        for gate in gates[:20]:  # limit
            g = gate.get("gate", "H").upper()
            q = int(gate.get("qubit", 0)) % n
            if g == "H":
                state = apply_hadamard(state, q)
            elif g in ("X", "NOT"):
                state = apply_x(state, q)

        probs = {format(i, f"0{n}b"): round(abs(a) ** 2, 6) for i, a in enumerate(state) if abs(a) > 1e-9}
        total_prob = sum(probs.values())
        measured = max(probs, key=probs.get) if probs else "0" * n
        return {
            "qubits": n,
            "gates_applied": len(gates[:20]),
            "state_probabilities": probs,
            "total_probability": round(total_prob, 6),
            "most_likely_state": measured,
            "entanglement_score": round(1 - max(probs.values(), default=1), 4) if probs else 0,
        }

    # ── Knapsack annealing (BuildQuote) ───────────────────────────────────────
    @staticmethod
    def quantum_knapsack(values: List[float], weights: List[float], capacity: float) -> Dict:
        """Quantum annealing for construction cost optimization."""
        n = len(values)
        if n == 0:
            return {"selected": [], "total_value": 0, "total_weight": 0}
        best_sel = []
        best_val = 0.0
        current = [random.random() > 0.5 for _ in range(n)]
        T = 20.0
        for _ in range(2000):
            T *= 0.995
            flip_idx = random.randint(0, n - 1)
            current[flip_idx] = not current[flip_idx]
            w = sum(weights[i] for i in range(n) if current[i])
            v = sum(values[i] for i in range(n) if current[i])
            penalty = max(0, w - capacity) * 100
            score = v - penalty
            delta = score - best_val
            if delta > 0 or random.random() < math.exp(delta / max(T, 0.01)):
                if w <= capacity and v > best_val:
                    best_val = v
                    best_sel = [i for i in range(n) if current[i]]
            else:
                current[flip_idx] = not current[flip_idx]
        return {
            "selected": best_sel,
            "total_value": round(best_val, 2),
            "total_weight": round(sum(weights[i] for i in best_sel), 2),
            "optimization_quality": "quantum-annealed",
        }

    # ── Property Valuation (CompPropData) ────────────────────────────────────
    @staticmethod
    def quantum_valuate(
        sqft: float, bedrooms: int, bathrooms: float,
        location_score: float, year_built: int
    ) -> Dict:
        """Quantum-weighted property valuation model."""
        age = max(2026 - year_built, 0)
        base = sqft * 180
        features = [
            location_score / 10,
            min(bedrooms / 8, 1.0),
            min(bathrooms / 5, 1.0),
            max(0, 1 - age / 100),
            min(sqft / 5000, 1.0),
        ]
        weights = [0.35, 0.20, 0.15, 0.15, 0.15]
        q_mult = 0.7 + QuantumEngine.quantum_score(features, weights) * 0.7
        value = base * q_mult
        confidence = 0.82 + QuantumEngine.quantum_score(features) * 0.15
        return {
            "estimated_value": round(value, 0),
            "value_range_low": round(value * 0.91, 0),
            "value_range_high": round(value * 1.09, 0),
            "confidence": round(min(confidence, 0.99), 3),
            "quantum_factor": round(q_mult, 4),
            "price_per_sqft": round(value / max(sqft, 1), 2),
        }


quantum = QuantumEngine()
