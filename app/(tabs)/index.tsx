// app/(tabs)/index.tsx — Home screen
// Sianlk | The unified Sianlk AI platform
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { domainChat } from '../../src/services/ai';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import Colors from '../../src/theme/colors';
import Typography from '../../src/theme/typography';
import Analytics from '../../src/services/analytics';

const ACTIONS = [
  { id: '1', title: 'Platform Hub', icon: 'sparkles-outline' },
  { id: '2', title: 'App Orchestrator', icon: 'sparkles-outline' },
  { id: '3', title: 'User Intelligence', icon: 'sparkles-outline' },
  { id: '4', title: 'AI Dashboard', icon: 'sparkles-outline' },
  { id: '5', title: 'Unified Inbox', icon: 'sparkles-outline' },
];

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const [prompt, setPrompt] = useState('');
  const [resp, setResp] = useState('');
  const [loading, setLoading] = useState(false);

  async function askAI() {
    if (!prompt.trim()) return;
    setLoading(true);
    Analytics.aiQuery(prompt, 'platform');
    try {
      const r = await domainChat(prompt);
      setResp(r);
      Analytics.aiResponse(true, 'gpt-4o');
    } catch (e) {
      setResp('AI unavailable. Check connection.');
      Analytics.error('AI_FAIL', String(e), 'Home');
    } finally { setLoading(false); }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name ?? 'User'} 👋</Text>
          <Text style={styles.tagline}>The unified Sianlk AI platform</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color={Colors.gray600} />
        </TouchableOpacity>
      </View>

      <Card variant="ai" style={styles.aiCard}>
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={14} color={Colors.primary} />
          <Text style={styles.aiBadgeText}>AI — platform</Text>
        </View>
        <TextInput
          style={styles.aiInput}
          placeholder="Ask Sianlk AI anything..."
          placeholderTextColor={Colors.gray400}
          value={prompt} onChangeText={setPrompt} multiline
        />
        <Button label={loading ? 'Thinking...' : 'Ask AI'} onPress={askAI} variant="ai" size="sm" loading={loading} disabled={!prompt.trim()} />
        {resp ? (
          <View style={styles.aiResp}>
            <Text style={styles.aiRespLabel}>AI Response</Text>
            <Text style={styles.aiRespText}>{resp}</Text>
          </View>
        ) : null}
      </Card>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        {ACTIONS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.gridItem} onPress={()=>Analytics.featureUsed(item.title)} activeOpacity={0.7}>
            <View style={styles.gridIcon}>
              <Ionicons name="sparkles-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.gridLabel} numberOfLines={2}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: Colors.background },
  content:   { padding:20, paddingBottom:40 },
  header:    { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  greeting:  { ...Typography.h2, color: Colors.textPrimary },
  tagline:   { ...Typography.bodySm, color: Colors.textSecondary, marginTop:2 },
  notifBtn:  { padding:8, borderRadius:12, backgroundColor: Colors.gray100 },
  aiCard:    { marginBottom:28, padding:16 },
  aiBadge:   { flexDirection:'row', alignItems:'center', marginBottom:12 },
  aiBadgeText: { ...Typography.label, color: Colors.primary, marginLeft:6 },
  aiInput:   { ...Typography.bodyMd, color: Colors.textPrimary, minHeight:60, marginBottom:12, textAlignVertical:'top' },
  aiResp:    { marginTop:16, padding:12, backgroundColor: Colors.gray50, borderRadius:10 },
  aiRespLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom:6 },
  aiRespText:  { ...Typography.bodyMd, color: Colors.textPrimary },
  sectionTitle: { ...Typography.h4, color: Colors.textPrimary, marginBottom:16 },
  grid:      { flexDirection:'row', flexWrap:'wrap', gap:12 },
  gridItem:  { width:'30%', alignItems:'center', backgroundColor: Colors.surface, borderRadius:14, padding:14, elevation:1 },
  gridIcon:  { width:44, height:44, borderRadius:12, alignItems:'center', justifyContent:'center', marginBottom:8, backgroundColor: Colors.aiBackground },
  gridLabel: { ...Typography.caption, color: Colors.textPrimary, textAlign:'center' },
});
