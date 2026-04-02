import React, {useState, useRef} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions} from 'react-native';

const SLIDES = [{"emoji": "\ud83d\ude80", "title": "Sianlk", "body": "One Platform. Infinite Possibilities."}, {"emoji": "\ud83d\udd12", "title": "Bank-Grade Security", "body": "Your data is protected with end-to-end encryption and MFA."}, {"emoji": "\u26a1", "title": "Built for Speed", "body": "Real-time AI processing with sub-second response times."}];
const {width} = Dimensions.get('window');

export default function OnboardingScreen({navigation}: any) {
  const [idx, setIdx] = useState(0);
  const ref = useRef<FlatList>(null);

  const next = () => {
    if (idx < SLIDES.length - 1) {
      ref.current?.scrollToIndex({index: idx + 1});
      setIdx(idx + 1);
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={ref}
        data={SLIDES}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({item}) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === idx && styles.dotActive]} />
        ))}
      </View>
      <TouchableOpacity style={styles.btn} onPress={next}>
        <Text style={styles.btnTxt}>{idx === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
      </TouchableOpacity>
      {idx > 0 && (
        <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.skip}>
          <Text style={styles.skipTxt}>Skip</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const PRIMARY = '#1D4ED8';
const styles = StyleSheet.create({
  container: {flex:1, backgroundColor:'#FAFAFA', alignItems:'center'},
  slide:     {width, alignItems:'center', justifyContent:'center', padding:40},
  emoji:     {fontSize:72, marginBottom:24},
  title:     {fontSize:28, fontWeight:'700', color:'#111827', textAlign:'center', marginBottom:12},
  body:      {fontSize:16, color:'#6B7280', textAlign:'center', lineHeight:24},
  dots:      {flexDirection:'row', gap:8, marginBottom:32},
  dot:       {width:8, height:8, borderRadius:4, backgroundColor:'#E5E7EB'},
  dotActive: {backgroundColor:PRIMARY, width:24},
  btn:       {backgroundColor:PRIMARY, borderRadius:14, paddingVertical:16, paddingHorizontal:48, marginBottom:16},
  btnTxt:    {color:'#fff', fontSize:17, fontWeight:'700'},
  skip:      {marginBottom:8},
  skipTxt:   {color:'#9CA3AF', fontSize:15},
});
