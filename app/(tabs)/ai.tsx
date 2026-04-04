// app/(tabs)/ai.tsx — AI Workforce screen
// Sianlk — AI Agents & Workforce
import { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AIWorkforceAgent, AgentStatus } from '../../src/agents/AIWorkforceAgent';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import Colors from '../../src/theme/colors';
import Typography from '../../src/theme/typography';
import Analytics from '../../src/services/analytics';

const agent = new AIWorkforceAgent('analyst');

interface AgentLog {
  id: string;
  type: string;
  status: 'pending' | 'done' | 'error';
  output?: string;
  confidence?: number;
}

export default function AIScreen() {
  const [taskInput, setTaskInput] = useState('');
  const [taskType, setTaskType] = useState('Platform Hub');
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [running, setRunning] = useState(false);

  async function runAgent() {
    if (!taskInput.trim()) return;
    setRunning(true);
    const taskId = Date.now().toString();
    const log: AgentLog = { id: taskId, type: taskType, status: 'pending' };
    setLogs(prev => [log, ...prev]);
    Analytics.agentTask(taskType, true);

    try {
      const start = Date.now();
      const result = await agent.executeTask({
        id: taskId,
        type: taskType,
        input: taskInput,
      });
      Analytics.agentTask(taskType, true, Date.now() - start);
      setLogs(prev => prev.map(l =>
        l.id === taskId
          ? { ...l, status: 'done', output: result.output, confidence: result.confidence }
          : l
      ));
    } catch (e) {
      setLogs(prev => prev.map(l =>
        l.id === taskId ? { ...l, status: 'error', output: String(e) } : l
      ));
    } finally {
      setRunning(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AI Workforce</Text>
      <Text style={styles.subtitle}>Domain: platform</Text>

      <Card variant="ai" style={styles.card}>
        <Text style={styles.label}>Task Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagRow}>
          {['Platform Hub','App Orchestrator','User Intelligence','AI Dashboard','Unified Inbox'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.tag, taskType === f && styles.tagActive]}
              onPress={() => setTaskType(f)}
            >
              <Text style={[styles.tagText, taskType === f && styles.tagTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Task Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Describe what the AI agent should do..."
          placeholderTextColor={Colors.gray400}
          value={taskInput}
          onChangeText={setTaskInput}
          multiline
          numberOfLines={4}
        />
        <Button
          label={running ? 'Agent Working...' : 'Run AI Agent'}
          onPress={runAgent}
          variant="ai"
          loading={running}
          disabled={!taskInput.trim()}
          fullWidth
        />
      </Card>

      {logs.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Agent Log</Text>
          {logs.map((log) => (
            <Card key={log.id} variant={log.status === 'done' ? 'default' : log.status === 'error' ? 'outlined' : 'ai'} style={styles.logCard}>
              <View style={styles.logHeader}>
                <Text style={styles.logType}>{log.type}</Text>
                <View style={[styles.statusBadge, styles[`status_${log.status}`]]}>
                  <Text style={styles.statusText}>{log.status}</Text>
                </View>
              </View>
              {log.output && <Text style={styles.logOutput}>{log.output}</Text>}
              {log.confidence !== undefined && (
                <Text style={styles.confidence}>Confidence: {(log.confidence * 100).toFixed(0)}%</Text>
              )}
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { padding: 20, paddingBottom: 40 },
  title:     { ...Typography.h2, color: Colors.textPrimary, marginBottom: 4 },
  subtitle:  { ...Typography.bodySm, color: Colors.textSecondary, marginBottom: 24, textTransform: 'capitalize' },
  card:      { marginBottom: 24, padding: 16 },
  label:     { ...Typography.label, color: Colors.textSecondary, marginBottom: 10 },
  tagRow:    { flexDirection: 'row', marginBottom: 16 },
  tag:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.gray100, marginRight: 8 },
  tagActive: { backgroundColor: Colors.primary },
  tagText:   { ...Typography.caption, color: Colors.textSecondary },
  tagTextActive: { color: '#fff' },
  input:     { borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 10, padding: 12,
    color: Colors.textPrimary, minHeight: 80, textAlignVertical: 'top', marginBottom: 16, ...Typography.bodyMd },
  sectionTitle: { ...Typography.h4, color: Colors.textPrimary, marginBottom: 12 },
  logCard:   { marginBottom: 12, padding: 14 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  logType:   { ...Typography.label, color: Colors.textPrimary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  status_pending: { backgroundColor: Colors.warningLight },
  status_done:    { backgroundColor: Colors.successLight },
  status_error:   { backgroundColor: Colors.errorLight },
  statusText: { ...Typography.caption, fontWeight: '600' },
  logOutput:  { ...Typography.bodySm, color: Colors.textSecondary, marginBottom: 8 },
  confidence: { ...Typography.caption, color: Colors.primary, fontWeight: '600' },
});
