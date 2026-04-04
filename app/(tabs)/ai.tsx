// app/(tabs)/ai.tsx — AI Workforce screen
// Sianlk
import { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { AIWorkforceAgent } from '../../src/agents/AIWorkforceAgent';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import Colors from '../../src/theme/colors';
import Typography from '../../src/theme/typography';
import Analytics from '../../src/services/analytics';

const agent = new AIWorkforceAgent('analyst');
const FEATURES = ['Platform Hub','App Orchestrator','User Intelligence','AI Dashboard','Unified Inbox'];

interface Log { id: string; type: string; status: 'pending'|'done'|'error'; output?: string; confidence?: number; }

export default function AIScreen() {
  const [taskInput, setTaskInput] = useState('');
  const [taskType, setTaskType] = useState(FEATURES[0]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [running, setRunning] = useState(false);

  async function runAgent() {
    if (!taskInput.trim()) return;
    setRunning(true);
    const id = Date.now().toString();
    setLogs(p => [{id, type: taskType, status: 'pending'}, ...p]);
    const s = Date.now();
    try {
      const r = await agent.executeTask({id, type: taskType, input: taskInput});
      Analytics.agentTask(taskType, true, Date.now()-s);
      setLogs(p => p.map(l => l.id===id ? {...l, status:'done', output:r.output, confidence:r.confidence} : l));
    } catch (e) {
      setLogs(p => p.map(l => l.id===id ? {...l, status:'error', output:String(e)} : l));
    } finally { setRunning(false); }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>AI Workforce</Text>
      <Text style={styles.sub}>Domain: platform</Text>
      <Card variant="ai" style={styles.card}>
        <Text style={styles.label}>Task Type</Text>
        <ScrollView horizontal style={styles.tagRow}>
          {FEATURES.map(f => (
            <TouchableOpacity key={f} style={[styles.tag, taskType===f && styles.tagOn]} onPress={()=>setTaskType(f)}>
              <Text style={[styles.tagTxt, taskType===f && styles.tagTxtOn]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.label}>Task Description</Text>
        <TextInput
          style={styles.input} placeholder="Describe what the AI agent should do..."
          placeholderTextColor={Colors.gray400} value={taskInput} onChangeText={setTaskInput}
          multiline numberOfLines={4}
        />
        <Button label={running ? 'Agent Working...' : 'Run AI Agent'} onPress={runAgent}
          variant="ai" loading={running} disabled={!taskInput.trim()} fullWidth />
      </Card>
      {logs.map(log => (
        <Card key={log.id} variant={log.status==='done'?'default':log.status==='error'?'outlined':'ai'} style={styles.log}>
          <View style={styles.logHdr}>
            <Text style={styles.logType}>{log.type}</Text>
            <View style={[styles.badge, styles['badge_'+log.status]]}>
              <Text style={styles.badgeTxt}>{log.status}</Text>
            </View>
          </View>
          {log.output && <Text style={styles.logOut}>{log.output}</Text>}
          {log.confidence !== undefined && <Text style={styles.conf}>Confidence: {(log.confidence*100).toFixed(0)}%</Text>}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex:1,backgroundColor:Colors.background},
  content:   {padding:20,paddingBottom:40},
  title:     {...Typography.h2,color:Colors.textPrimary,marginBottom:4},
  sub:       {...Typography.bodySm,color:Colors.textSecondary,marginBottom:24},
  card:      {marginBottom:24,padding:16},
  label:     {...Typography.label,color:Colors.textSecondary,marginBottom:10},
  tagRow:    {flexDirection:'row',marginBottom:16},
  tag:       {paddingHorizontal:14,paddingVertical:8,borderRadius:20,backgroundColor:Colors.gray100,marginRight:8},
  tagOn:     {backgroundColor:Colors.primary},
  tagTxt:    {...Typography.caption,color:Colors.textSecondary},
  tagTxtOn:  {color:'#fff'},
  input:     {borderWidth:1,borderColor:Colors.inputBorder,borderRadius:10,padding:12,color:Colors.textPrimary,minHeight:80,textAlignVertical:'top',marginBottom:16},
  log:       {marginBottom:12,padding:14},
  logHdr:    {flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8},
  logType:   {...Typography.label,color:Colors.textPrimary},
  badge:     {paddingHorizontal:10,paddingVertical:4,borderRadius:12},
  badge_pending: {backgroundColor:Colors.warningLight},
  badge_done:    {backgroundColor:Colors.successLight},
  badge_error:   {backgroundColor:Colors.errorLight},
  badgeTxt:  {...Typography.caption,fontWeight:'600'},
  logOut:    {...Typography.bodySm,color:Colors.textSecondary,marginBottom:8},
  conf:      {...Typography.caption,color:Colors.primary,fontWeight:'600'},
});
