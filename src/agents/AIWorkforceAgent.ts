// AI Workforce Agent — Sianlk
// Autonomous AI worker for platform

import { aiComplete, domainChat, AIMessage } from '../services/ai';
import AI_CONFIG from '../config/ai.config';

export type AgentStatus = 'idle' | 'thinking' | 'working' | 'done' | 'error';

export interface AgentTask {
  id: string;
  type: string;
  input: string;
  context?: Record<string, string>;
}

export interface AgentResult {
  taskId: string;
  output: string;
  confidence: number;
  reasoning: string;
  actions: string[];
}

// Specialised AI agents for platform
const AGENT_PERSONAS = {
  analyst: {
    name: 'Sianlk Analyst',
    role: `Expert platform analyst with deep knowledge of platform orchestration, user intelligence, cross-app AI unification.`,
    capabilities: ["Platform Hub", "App Orchestrator", "User Intelligence", "AI Dashboard", "Unified Inbox"],
  },
  advisor: {
    name: 'Sianlk Advisor',
    role: `Senior platform advisor providing strategic recommendations.`,
    capabilities: ['Strategic planning', 'Risk assessment', 'Optimization'],
  },
  automator: {
    name: 'Sianlk Automator',
    role: `Autonomous platform task executor and workflow manager.`,
    capabilities: ['Task automation', 'Workflow orchestration', 'Process optimisation'],
  },
};

export class AIWorkforceAgent {
  private persona: keyof typeof AGENT_PERSONAS;
  private conversationHistory: AIMessage[] = [];
  private status: AgentStatus = 'idle';
  private taskQueue: AgentTask[] = [];

  constructor(persona: keyof typeof AGENT_PERSONAS = 'analyst') {
    this.persona = persona;
  }

  getStatus(): AgentStatus { return this.status; }

  async executeTask(task: AgentTask): Promise<AgentResult> {
    this.status = 'thinking';
    const p = AGENT_PERSONAS[this.persona];

    const systemPrompt = `You are ${p.name}, an AI workforce agent.
Role: ${p.role}
Capabilities: ${p.capabilities.join(', ')}
Domain: platform

When executing tasks:
1. Reason step-by-step
2. Provide confidence score (0-1)
3. List concrete actions taken
4. Return structured JSON output`;

    const userPrompt = `Task ID: ${task.id}
Task Type: ${task.type}
Input: ${task.input}
Context: ${JSON.stringify(task.context ?? {})}

Execute this task and respond with JSON:
{"output":"result","confidence":0.9,"reasoning":"...","actions":["..."]}`;

    this.status = 'working';

    const response = await aiComplete([
      { role: 'system', content: systemPrompt },
      ...this.conversationHistory,
      { role: 'user', content: userPrompt },
    ]);

    this.conversationHistory.push(
      { role: 'user', content: userPrompt },
      { role: 'assistant', content: response.content }
    );

    // Keep history bounded
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    this.status = 'done';

    try {
      const parsed = JSON.parse(response.content);
      return { taskId: task.id, ...parsed };
    } catch {
      return {
        taskId: task.id,
        output: response.content,
        confidence: 0.7,
        reasoning: 'Direct response',
        actions: ['Processed input', 'Generated response'],
      };
    }
  }

  async orchestrate(tasks: AgentTask[]): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    for (const task of tasks) {
      const result = await this.executeTask(task);
      results.push(result);
    }
    return results;
  }

  reset() {
    this.conversationHistory = [];
    this.status = 'idle';
  }
}

// Convenience factory
export const createAgent = (persona: keyof typeof AGENT_PERSONAS = 'analyst') =>
  new AIWorkforceAgent(persona);

export default AIWorkforceAgent;
