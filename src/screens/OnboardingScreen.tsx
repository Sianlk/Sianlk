/**
 * Onboarding flow — required by App Store reviewers.
 * Presents value proposition + permissions rationale before requesting.
 */
import React, {useState, useRef} from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  TouchableOpacity, Platform, StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

const SLIDES = [
  {
    id: '1', title: 'Welcome',
    subtitle: 'The most advanced AI platform built for you.',
    icon: '🚀',
    bg: '#0f0f1a',
  },
  {
    id: '2', title: 'AI-Powered',
    subtitle: 'Quantum-grade AI working for you 24/7, secured and private.',
    icon: '⚡',
    bg: '#0a1628',
  },
  {
    id: '3', title: 'Secure by Design',
    subtitle: 'Military-grade encryption. Your data belongs only to you.',
    icon: '🔐',
    bg: '#0f1a0a',
  },
  {
    id: '4', title: 'Get Started',
    subtitle: 'Join thousands of users already using the platform.',
    icon: '✅',
    bg: '#1a0f28',
    isFinal: true,
  },
];

interface Props {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<Props> = ({onComplete}) => {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({index: index + 1, animated: true});
      setIndex(i => i + 1);
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_complete', '1');
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal pagingEnabled scrollEnabled={false}
        keyExtractor={s => s.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => (
          <View style={[styles.slide, {backgroundColor: item.bg, width}]}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        {SLIDES[index].isFinal ? (
          <TouchableOpacity style={styles.btn} onPress={finish} accessibilityRole="button">
            <Text style={styles.btnText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btn} onPress={next} accessibilityRole="button">
            <Text style={styles.btnText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f0f1a'},
  slide: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  icon: {fontSize: 80, marginBottom: 24},
  title: {fontSize: 32, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 12},
  subtitle: {fontSize: 17, color: '#aaa', textAlign: 'center', lineHeight: 26},
  footer: {padding: 24, alignItems: 'center'},
  dots: {flexDirection: 'row', marginBottom: 20},
  dot: {width: 8, height: 8, borderRadius: 4, backgroundColor: '#333', marginHorizontal: 4},
  dotActive: {width: 24, backgroundColor: '#6d6dff'},
  btn: {backgroundColor: '#6d6dff', paddingHorizontal: 48, paddingVertical: 16,
         borderRadius: 14, width: '100%', alignItems: 'center'},
  btnText: {color: '#fff', fontSize: 17, fontWeight: '700'},
});
