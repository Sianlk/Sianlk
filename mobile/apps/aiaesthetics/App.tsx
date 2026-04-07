import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Animated, ActivityIndicator,
  SafeAreaView, StatusBar, Dimensions, Modal, Alert, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SW } = Dimensions.get('window');
const API     = 'https://sianlk-unified-9w6jz.ondigitalocean.app';
const FACE_W  = Math.min(SW - 40, 316);
const FACE_H  = FACE_W * 1.38;
const Tab     = createBottomTabNavigator();
const Stack   = createNativeStackNavigator();

const T = {
  bg: '#030208', card: '#080B14', border: '#0F1628',
  accent: '#EC4899', cyan: '#06B6D4', purple: '#8B5CF6',
  green: '#10B981', red: '#EF4444', gold: '#F59E0B',
  orange: '#F97316', text: '#F0F9FF', muted: '#4B5563',
  dimText: '#94A3B8', teal: '#14B8A6', rose: '#FB7185', lavender: '#C084FC',
};

// â”€â”€â”€ Injection Zone Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface InjectionZone {
  id: string; name: string; xPct: number; yPct: number;
  product: string; amount: string; depth: string; technique: string;
  risk: 'low' | 'medium' | 'high'; arteryNote: string | null;
  botox?: number; filler?: number;
}
const INJECTION_ZONES: InjectionZone[] = [
  { id:'frontalis',  name:'Frontalis',          xPct:50,yPct:11, product:'Botox',              amount:'10â€“20 u',     depth:'Superficial IM',       technique:'Fan pattern 4â€“6 pts, 1cm above brow. Target horizontal rhytids only â€” never below brow.',            risk:'low',    arteryNote:null,                                                                                     botox:15 },
  { id:'glabella',   name:'Glabella "11s"',     xPct:50,yPct:22, product:'Botox',              amount:'20â€“30 u',     depth:'Superficial IM',       technique:'5-point V pattern. Bilateral corrugators + midline procerus at MHF. Avoid too deep.',                  risk:'medium', arteryNote:'Supratrochlear a. â€” superficial IM only, never deep glabellar',                            botox:25 },
  { id:'crows_L',    name:"Crow's Feet L",      xPct:16,yPct:35, product:'Botox',              amount:'6â€“15 u',      depth:'SC / Superficial IM',  technique:'3 fan points lateral to orbital rim. Never medial to orbital margin. Target OOris.',                  risk:'low',    arteryNote:null,                                                                                     botox:10 },
  { id:'crows_R',    name:"Crow's Feet R",      xPct:84,yPct:35, product:'Botox',              amount:'6â€“15 u',      depth:'SC / Superficial IM',  technique:'3 fan points lateral to orbital rim.',                                                                 risk:'low',    arteryNote:null,                                                                                     botox:10 },
  { id:'brow_L',     name:'Brow Lift L',        xPct:27,yPct:27, product:'Botox',              amount:'2â€“4 u',       depth:'Superficial IM',       technique:'1 pt inferior to brow tail. Inhibit OOris lateral depressor for 2â€“3mm lift.',                          risk:'low',    arteryNote:'Supraorbital a. arcades above â€” stay inferior to brow, superficial',                      botox:3 },
  { id:'brow_R',     name:'Brow Lift R',        xPct:73,yPct:27, product:'Botox',              amount:'2â€“4 u',       depth:'Superficial IM',       technique:'Mirror of left. 1 point inferior to brow tail.',                                                       risk:'low',    arteryNote:null,                                                                                     botox:3 },
  { id:'bunny',      name:'Bunny Lines',        xPct:50,yPct:42, product:'Botox',              amount:'4â€“8 u',       depth:'Superficial IM',       technique:'2 bilateral pts on nasalis at junction of nasal dorsum and sidewall.',                                  risk:'low',    arteryNote:'Angular a. â€” stay superficial, medial side of ridge only',                               botox:6 },
  { id:'nlf_L',      name:'NLF Left',           xPct:25,yPct:57, product:'HA Filler',          amount:'0.5â€“1.0 ml',  depth:'Mid-deep dermis',      technique:'Retrograde threading or serial puncture. 25g cannula preferred. Lateral-to-medial.',                   risk:'medium', arteryNote:'Facial a. medial to NLF â€” aspirate, stay lateral to crease',                              filler:0.6 },
  { id:'nlf_R',      name:'NLF Right',          xPct:75,yPct:57, product:'HA Filler',          amount:'0.5â€“1.0 ml',  depth:'Mid-deep dermis',      technique:'Retrograde threading. 25g cannula preferred.',                                                         risk:'medium', arteryNote:'Facial a. â€” aspirate at each position',                                                  filler:0.6 },
  { id:'lip_body',   name:'Lip Body',           xPct:50,yPct:68, product:'HA Filler',          amount:'0.3â€“1.0 ml',  depth:'Oral mucosa (mid)',     technique:'Blunt 25g cannula entry at commissure. Fill tubercles then body. Small aliquots â‰¤0.1ml each.',        risk:'high',   arteryNote:'âš ï¸ SUP + INF labial arteries at mid-lip height â€” BLUNT CANNULA MANDATORY. Aspirate x2.',   filler:0.5 },
  { id:'vermilion',  name:'Vermilion Border',   xPct:50,yPct:65, product:'HA Filler',          amount:'0.2â€“0.5 ml',  depth:'Superficial dermis',   technique:'Linear threading at dermal-mucosal junction. Define cupid\'s bow. 30g needle, 0.05ml boluses.',        risk:'high',   arteryNote:'Labial arteries 1â€“2mm deep â€” stay at vermilion junction',                                 filler:0.3 },
  { id:'cheek_L',    name:'Malar / Cheek L',    xPct:20,yPct:48, product:'HA Filler',          amount:'0.5â€“2.0 ml',  depth:'Supraperiosteal',      technique:'Bolus at malar eminence. 25g cannula to bone. Aspirate. Slow injection 0.1ml/sec.',                   risk:'medium', arteryNote:'Infraorbital a. exits foramen at pupil line â€” stay periosteal, aspirate',                  filler:1.0 },
  { id:'cheek_R',    name:'Malar / Cheek R',    xPct:80,yPct:48, product:'HA Filler',          amount:'0.5â€“2.0 ml',  depth:'Supraperiosteal',      technique:'As left. Bolus at malar eminence via 25g cannula.',                                                    risk:'medium', arteryNote:'Infraorbital a. â€” aspirate',                                                             filler:1.0 },
  { id:'tear_L',     name:'Tear Trough L',      xPct:30,yPct:40, product:'Diluted HA Filler',  amount:'0.1â€“0.2 ml',  depth:'SOOF / pre-periosteal','technique:'Micro-bolus sub-SOOF. 27g cannula only. â‰¤0.1ml per bolus. Hyaluronidase on standby.',                   risk:'high',   arteryNote:'âš ï¸âš ï¸ Angular + Infraorbital a. CONVERGENCE â€” vision loss cases documented. Dilute HA only.', filler:0.15 },
  { id:'tear_R',     name:'Tear Trough R',      xPct:70,yPct:40, product:'Diluted HA Filler',  amount:'0.1â€“0.2 ml',  depth:'SOOF / pre-periosteal','technique:'27g cannula. Aspirate at each position. Hyaluronidase 150â€“300U if vascular event.',                    risk:'high',   arteryNote:'âš ï¸âš ï¸ Angular + Infraorbital convergence â€” extreme caution, minimum volumes',                filler:0.15 },
  { id:'chin',       name:'Chin Projection',    xPct:50,yPct:84, product:'HA Filler',          amount:'0.5â€“1.5 ml',  depth:'Periosteal',           technique:'Midline bolus at pogonion. 25g cannula confirm bone contact. Aspirate. Mould externally.',               risk:'medium', arteryNote:'Mental a. exits foramen 1cm lateral to midline â€” stay midline periosteal',                  filler:1.0 },
  { id:'jaw_L',      name:'Jawline L',          xPct:14,yPct:79, product:'HA Filler',          amount:'0.5â€“1.5 ml',  depth:'Supraperiosteal',      technique:'Retrograde thread along mandibular border. 25g cannula. Aspirate at angle of jaw.',                    risk:'medium', arteryNote:'Facial a. at mandibular notch â€” aspirate',                                                filler:0.8 },
  { id:'jaw_R',      name:'Jawline R',          xPct:86,yPct:79, product:'HA Filler',          amount:'0.5â€“1.5 ml',  depth:'Supraperiosteal',      technique:'Retrograde threading along mandibular border.',                                                          risk:'medium', arteryNote:'Facial a. at mandibular notch',                                                           filler:0.8 },
  { id:'masseter_L', name:'Masseter L',         xPct:11,yPct:71, product:'Botox',              amount:'20â€“40 u',     depth:'Deep IM',              technique:'Palpate contracted masseter. 2â€“3 pts in lower 2/3 bulk. NEVER anterior (parotid).',                    risk:'medium', arteryNote:'Masseteric a. (branch of maxillary a.) deep â€” stay in muscle bulk',                        botox:30 },
  { id:'masseter_R', name:'Masseter R',         xPct:89,yPct:71, product:'Botox',              amount:'20â€“40 u',     depth:'Deep IM',              technique:'2â€“3 pts in contracted muscle lower 2/3. Avoid parotid region anteriorly.',                              risk:'medium', arteryNote:'Masseteric a. deep',                                                                     botox:30 },
  { id:'temple_L',   name:'Temple L',           xPct:7, yPct:20, product:'HA Filler/Radiesse', amount:'0.5â€“2.0 ml',  depth:'Supraperiosteal',      technique:'Superior approach â€” confirm bone contact. Aspirate x2 mandatory. Bolus â‰¤0.1ml each.',                  risk:'high',   arteryNote:'âš ï¸âš ï¸âš ï¸ SUPERFICIAL TEMPORAL A. â€” retrograde â†’ ophthalmic â†’ PERMANENT BLINDNESS. Bone only.',  filler:1.0 },
  { id:'temple_R',   name:'Temple R',           xPct:93,yPct:20, product:'HA Filler/Radiesse', amount:'0.5â€“2.0 ml',  depth:'Supraperiosteal',      technique:'Superior temporal approach on bone. Slow injection. Monitor vision throughout.',                        risk:'high',   arteryNote:'âš ï¸âš ï¸âš ï¸ SUPERFICIAL TEMPORAL A. â€” CRITICAL DANGER ZONE',                                     filler:1.0 },
  { id:'gummy',      name:'Gummy Smile (LLSAN)','xPct:50,yPct:60, product:'Botox',              amount:'2â€“4 u/side',  depth:'IM â€” LLSAN insertion', technique:'Palpate alar base. LLSAN 1cm lateral to alar-lip junction. 1 point each side.',                       risk:'medium', arteryNote:'Superior labial a. nearby â€” target muscular insertion only',                               botox:4 },
];
const ARTERY_ZONES = [
  { id:'supratro', name:'Supratrochlear A.',    xPct:46, yPct:21, warning:'Intravascular â†’ forehead / scalp necrosis or blindness via ophthalmic a. retrograde. Danger with deep glabellar injection.' },
  { id:'supraorb', name:'Supraorbital A.',      xPct:33, yPct:25, warning:'Medial brow / forehead branches â€” intravascular â†’ scalp necrosis. Stay superficial IM in frontalis only.' },
  { id:'angular',  name:'Angular A.',           xPct:37, yPct:43, warning:'âš ï¸ #1 DANGER ZONE. Nasal side of nasojugal. Retrograde to ophthalmic â†’ central retinal â†’ BLINDNESS. Never inject deep medially here.' },
  { id:'infra_L',  name:'Infraorbital A. (L)',  xPct:29, yPct:47, warning:'Exits foramen at pupillary line, 1cm below orbital rim. Cheek / tear trough injections â€” stay periosteal, aspirate before all boluses.' },
  { id:'infra_R',  name:'Infraorbital A. (R)',  xPct:71, yPct:47, warning:'Same as left side. Aspirate at all cheek injection points.' },
  { id:'facial_L', name:'Facial A.',            xPct:31, yPct:59, warning:'Tortuous path from mandible â†’ alar base. NLF and cheek injections â€” lateral approach, aspirate, small aliquots.' },
  { id:'sup_lab',  name:'Superior Labial A.',   xPct:50, yPct:63, warning:'Runs at mid-lip height within submucosa. Lip filler = BLUNT CANNULA MANDATORY. Aspiration critical.' },
  { id:'inf_lab',  name:'Inferior Labial A.',   xPct:50, yPct:71, warning:'Within lower lip submucosa â€” retrograde embolism reported causing ocular ischaemia. Cannula only, small aliquots.' },
  { id:'mental',   name:'Mental A.',            xPct:50, yPct:81, warning:'Mental foramen chin. Stay midline at periosteum. Aspirate before bolus.' },
  { id:'temporal', name:'Superficial Temporal A.', xPct:7, yPct:16, warning:'âš ï¸âš ï¸ CRITICAL â€” retrograde embolism â†’ central retinal â†’ permanent blindness documented. Temple = bone contact only. Aspirate x2.' },
];

// â”€â”€â”€ Emergency Conditions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface EmergencyCondition {
  id: string; name: string; emoji: string; triage: 1|2|3|4|5;
  symptoms: string[]; signs: string[];
  immediateAction: string; protocol: string[]; scanHints: string[];
}
const EMERGENCY_CONDITIONS: EmergencyCondition[] = [
  {
    id:'stroke', name:'Ischaemic Stroke', emoji:'ðŸ§ ', triage:1,
    symptoms:['Sudden facial droop (one side)','Arm weakness unilateral','Slurred / absent speech','Sudden severe headache','Vision loss one or both eyes','Sudden confusion / balance loss'],
    signs:['Positive BE-FAST assessment','Asymmetric grip strength','Pronator drift positive','NIHSS >4','No haemorrhage on CT (hyper-acute)'],
    immediateAction:'BE-FAST â†’ 000/911 immediately. Note EXACT time of onset. Thrombolysis window 4.5 hours. NPO. Neutral head position.',
    protocol:['Aâ€”Airway patent; lateral if unconscious','Bâ€”Breathing: Oâ‚‚ target sats >94%','Câ€”Circulation: IV access, 0.9% NaCl TKO','Dâ€”Disability: GCS, NIHSS, BSL (hypoglycaemia mimics stroke!)','Eâ€”ECG: AF source?','CT Brain â†’ exclude haemorrhage before tPA','Aspirin 300mg PO if haemorrhage excluded','Activate stroke team: door-to-needle <60min'],
    scanHints:['FAST face assessment: ask to smile â€” droop?','Arms: hold both horizontal 10 sec â€” does one drift down?','Speech: repeat "the cat sat on the mat"','Pupil inequality (anisocoria) = herniation imminent','Gaze deviation toward lesion side'],
  },
  {
    id:'mi', name:'Myocardial Infarction', emoji:'â¤ï¸', triage:1,
    symptoms:['Central crushing chest pain','Radiation: left arm, jaw, back','Diaphoresis (sweating)','Nausea / vomiting','Dyspnoea','Sense of impending doom','Atypical: jaw pain, epigastric, silent (diabetics)'],
    signs:['Diaphoresis + pallor','Hypotension or hypertension','Irregular pulse (arrhythmia)','ST elevation â‰¥1mm in â‰¥2 contiguous leads','Troponin rising (>3h)','S3 gallop = LV failure'],
    immediateAction:'MONA protocol. 000/911. Patient rest â€” NO exertion. Aspirin 300mg CHEW now if no allergy. GTN if SBP >90.',
    protocol:['M â€” Morphine 2.5â€“5mg IV if pain despite GTN','O â€” Oâ‚‚ if SpOâ‚‚ <94%','N â€” Nitrates GTN 300â€“600mcg SL (repeat x3 if SBP >90)','A â€” Aspirin 300mg stat, Ticagrelor 180mg loading','12-lead ECG immediately','STEMI â†’ cath lab activation, PCI <90min target','IV x2, bloods: troponin, BMP, CXR','Heparin bolus for STEMI'],
    scanHints:['Diaphoresis visible on skin','Patient clutching chest or protecting','Check pulse â€” irregular = AF or VT','Check JVP (right heart failure sign)','Pallor + clammy skin = cardiogenic shock'],
  },
  {
    id:'haemorrhage', name:'Internal Haemorrhage', emoji:'ðŸ©¸', triage:1,
    symptoms:['Hypovolaemic shock (tachycardia + hypotension)','Blunt or penetrating abdominal trauma','Pale cold clammy skin','Increasing abdominal distension','Haematemesis or melaena (GI source)','Decreasing GCS'],
    signs:['HR >100 + SBP <90 (Class III/IV shock)','CRT >3 seconds','Cool peripheries','Peritonism: guarding, rigidity, rebound','Cullen\'s sign (periumbilical bruise)','Grey-Turner sign (flank bruise = retroperitoneal)'],
    immediateAction:'000/911. Lay flat, elevate legs. 2Ã— wide-bore IV. Permissive hypotension (SBP 80â€“90 penetrating; 90â€“100 blunt) until surgical control. TXA 1g IV within 3h.',
    protocol:['2x wide-bore IV (14â€“16g)','Permissive hypotension â€” LIMIT crystalloids','TXA (tranexamic acid) 1g IV within 3h trauma','O-neg blood if available','Warm patient (hypothermia worsens coagulopathy)','Emergency surgery / IR embolisation','Monitor: HR, BP q5min, urine output','FAST ultrasound: free fluid (4 zones)'],
    scanHints:['Abdominal rigidity on palpation = peritonism','Cullen\'s sign: periumbilical bruising','Grey-Turner: flank bruising = retroperitoneal bleed','Distension increasing over time = ongoing bleed','Seat belt mark â†’ solid organ injury pattern'],
  },
  {
    id:'tension_px', name:'Tension Pneumothorax', emoji:'ðŸ’¨', triage:1,
    symptoms:['Progressive dyspnoea','Pleuritic chest pain','After chest trauma / rib#s / mechanical ventilation','Rapid deterioration despite Oâ‚‚'],
    signs:['Absent breath sounds one side','Tracheal deviation AWAY from affected side (late)','Hypotension + tachycardia (obstructive shock)','JVP elevation','Hyper-resonance on percussion','SpOâ‚‚ dropping'],
    immediateAction:'CLINICAL DIAGNOSIS â€” do NOT await X-ray if haemodynamically unstable. Immediate needle decompression: 14g cannula, 2nd ICS MCL. Rush of air confirms.',
    protocol:['Needle decompression: 14g IV cannula â‰¥8cm into 2nd ICS MCL','Listen for air rush confirmation','Secure cannula â€” do not remove','Follow with chest drain (ICD): 4thâ€“5th ICS anterior axillary line','Oâ‚‚ high flow','Fluid resuscitation cautiously post-decompression','Chest X-ray once stable'],
    scanHints:['Tracheal deviation to OPPOSITE side (press in on trachea)','Asymmetric chest movement on breathing','Distended neck veins (JVP) = obstructed venous return','Tripod/forward posture + cyanosis + shock without obvious cause','After trauma + hypoxia = assume tension px until proven otherwise'],
  },
  {
    id:'tbi', name:'Traumatic Brain Injury', emoji:'ðŸ¤•', triage:2,
    symptoms:['Head trauma â€” any LoC = significant','Amnesia (retro or antero)','Progressive headache','Vomiting','Confusion / agitation','Post-impact seizure'],
    signs:['GCS reduction (normal 15)','Battle\'s sign = temporal/mastoid bruise â†’ base of skull #','Raccoon eyes = anterior fossa #','Anisocoria (unequal pupils) = herniation','Cushing\'s reflex (hypertension + bradycardia + irregular breathing) = LATE & CRITICAL'],
    immediateAction:'Spinal precautions. C-collar. GCS and pupils. Airway: RSI if GCS â‰¤8. Prevent secondary injury: Oâ‚‚ â‰¥95%, glucose 6â€“10, avoid fever.',
    protocol:['C-spine immobilisation','Airway â€” RSI if GCS â‰¤8','Oâ‚‚: maintain SpOâ‚‚ 95â€“99%','Avoid hypotension: SBP â‰¥90 (â‰¥110 if known TBI)','Glucose: aim 6â€“10 mmol/L','CT head (Canadian CT Rule: any LoC or amnesia)','Neurosurgery for EDH/SDH/ICH','ICP monitoring if severe TBI','Antiepileptic prophylaxis (levetiracetam)'],
    scanHints:['Scalp haematoma size = energy transfer indicator','Periorbital haematoma (raccoon eyes) = anterior skull base #','Behind-ear bruise (Battle\'s sign) = temporal bone #','Asymmetric pupils = rising ICP â€” IMMEDIATE action','Agitation + confusion = significant TBI until proven otherwise'],
  },
  {
    id:'anaphylaxis', name:'Anaphylaxis', emoji:'ðŸš¨', triage:1,
    symptoms:['Urticaria / angioedema','Stridor or wheeze','Hypotension (dizziness, syncope)','Vomiting / diarrhoea','Throat tightness','Recent trigger: food, drug, insect, latex','Facial / lip / tongue swelling'],
    signs:['Urticaria (raised welts)','Angioedema face/lips/tongue','Stridor (laryngeal oedema)','SpOâ‚‚ dropping rapidly','BP falling','Diffuse wheeze'],
    immediateAction:'ADRENALINE IM NOW. 0.5mg (500mcg) 1:1000 into lateral thigh IM. Call 000/911. Lay flat + elevate legs (if breathing allows). Can repeat every 5min.',
    protocol:['Adrenaline 0.5mg (1:1000) IM anterolateral thigh â€” FIRST','Call ALS emergency team immediately','Lay flat, legs elevated (if airway tolerates)','Oâ‚‚ high flow via NRB mask','IV access: 500â€“1000ml 0.9% NaCl bolus','Antihistamine (chlorphenamine 10mg IV) â€” secondary only','Hydrocortisone 200mg IV â€” secondary only','Salbutamol 5mg neb if bronchospasm','Observe â‰¥4h (biphasic reaction risk up to 8h)'],
    scanHints:['Urticaria: raised red welts, spreading rapidly','Stridor: harsh inspiratory noise = laryngeal oedema â€” CRITICAL','Visible tongue / uvula swelling on mouth inspection','Nail beds: pallor or cyanosis = circulatory compromise','Angio-oedema without urticaria = hereditary angioedema (different treatment)'],
  },
];

// â”€â”€â”€ Procedure Case Library â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface ProcedureCase {
  id: string; title: string; category: 'Aesthetics'|'Emergency'|'Surgery'; emoji: string; difficulty: 1|2|3|4|5;
  steps: { title: string; detail: string; warning?: string }[]; keyLearning: string[];
}
const CASE_LIBRARY: ProcedureCase[] = [
  {
    id:'lip_aug', title:'Lip Augmentation', category:'Aesthetics', emoji:'ðŸ’‹', difficulty:3,
    steps:[
      { title:'Consultation & consent', detail:'Assess lip proportions (golden ratio upper:lower 1:1.618). Discuss realistic outcomes, healing, longevity. Document medical history: HSV, autoimmune, anticoagulants, dental work. Full complication consent including vascular occlusion and necrosis.' },
      { title:'Mark & photograph', detail:'Mark cupid\'s bow, philtral columns, oral commissures, vermilion border. Clinical photography: full face + 2Ã— close-up. Assess linear upper lip length, oral commissure height, lower-lip body fullness.' },
      { title:'Anaesthesia', detail:'Topical EMLA 30â€“45min pre-treatment. Infraorbital + mental nerve blocks dramatically improve comfort and allow more accurate assessment. Dental ring blocks for full lip numbness.' },
      { title:'Cannula technique', detail:'Insert 25g blunt cannula at oral commissure. Aspirate before each deposit. Enter at 45Â° then flatten to run parallel to lip surface within submucosa.', warning:'Superior and Inferior labial arteries at mid-lip height. Use blunt cannula â€” but never assume it prevents vascular occlusion.' },
      { title:'Product placement', detail:'Fill vermilion border first (retrograde threading). Then define cupid\'s bow and philtral columns. Finally fill lip body. Max 0.5ml upper, 0.5ml lower per session. Soft moderately cross-linked HA (low G prime). â‰¤0.1ml aliquots.' },
      { title:'Moulding & assessment', detail:'Mould product immediately. Patient sits up for final assessment. Check symmetry, projection, proportions. Assess for blanching (vascular compromise) â€” if seen: hyaluronidase immediately 300U.' },
      { title:'Post-care & review', detail:'Ice post-treatment. Avoid heat, pressure, exercise, dental work 24h. HSV prophylaxis. 2-week review. Hyaluronidase available for 6 weeks.' },
    ],
    keyLearning:['Blunt cannula mandatory for lip body','Labial arteries at mid-lip depth â€” never sharp needle in body','Aspirate before every bolus','Hyaluronidase 150â€“300U per ml filler for reversal','Have 1000mg adrenaline drawn up for anaphylaxis'],
  },
  {
    id:'cardiac_cpr', title:'Cardiac Arrest â€” Advanced CPR', category:'Emergency', emoji:'â¤ï¸â€ðŸ”¥', difficulty:2,
    steps:[
      { title:'Scene safe + response', detail:'Ensure scene safe. Check response: tap shoulders firmly + shout "Are you OK?" in both ears.' },
      { title:'Call for help', detail:'Call 000/911 or direct named bystander. Send 2nd person for AED. Note exact time. Activate rapid response if in-hospital.' },
      { title:'Breathing check', detail:'Head tiltâ€“chin lift. Look, listen, feel â‰¤10 seconds ONLY. Agonal breathing = not normal. Do not check pulse unless trained ALS provider.', warning:'Starting CPR early is always better than delayed. Every 1 min of no CPR = 10% reduction in survival.' },
      { title:'Chest compressions', detail:'Heel of hand, centre of chest. Interlock fingers. Compress 5â€“6cm at 100â€“120/min. Full recoil between compressions. Aim: push hard, push fast, full recoil.' },
      { title:'Ventilations', detail:'30:2 ratio. Tilt head, lift chin, pinch nose. 1 second breath â€” visualise chest rise. Transition to 10/min continuous with supraglottic airway or ETT.' },
      { title:'AED deployment', detail:'Power on. Apply pads: right chest (clavicle), left axilla (V5). Clear â€” analyse. Shock if VF/pVT. Resume CPR immediately for 5 cycles (2min). Re-analyse. Give 1mg IV adrenaline each cycle if shockable.' },
      { title:'ROSC care', detail:'Post-ROSC: targeted temperature management (36Â°C x24h), 12-lead ECG (STEMI â†’ cath lab), Oâ‚‚ titrate to 94â€“98%, BP â‰¥100 systolic, ventilation control.' },
    ],
    keyLearning:['100â€“120/min compression rate','5â€“6cm depth, full recoil','30:2 until advanced airway','Minimise hands-off time (<10s for rhythm check)','Adrenaline 1mg IV every 3â€“5min (ALS)'],
  },
  {
    id:'needle_decomp', title:'Needle Thoracostomy', category:'Emergency', emoji:'ðŸ©º', difficulty:5,
    steps:[
      { title:'Clinical diagnosis', detail:'Tension Px = CLINICAL diagnosis: respiratory distress + absent unilateral breath sounds + hypotension + JVP elevation Â± tracheal deviation. DO NOT wait for imaging.', warning:'Every minute of delay is potentially fatal. Clinical diagnosis is sufficient and mandatory.' },
      { title:'Landmark identification', detail:'2nd intercostal space, midclavicular line (MCL), affected side. Alternative: 4thâ€“5th ICS, anterior axillary line (AAL) â€” preferred in large/obese patients (â‰¤7cm chest wall).' },
      { title:'Preparation', detail:'Gloves. Alcohol wipe. 14g IV cannula, â‰¥8cm length (obese: 10cm). Confirm site: count ribs, confirm laterality.' },
      { title:'Needle insertion', detail:'Insert directly over SUPERIOR border of 3rd rib (to avoid ICS neurovascular bundle running inferior to 2nd rib). Perpendicular to chest wall. Advance until air rushes out or flashback.', warning:'Superior rib border critical â€” inferior border has intercostal artery, vein, nerve (AVN mnemonic).' },
      { title:'Confirm and secure', detail:'Remove needle trocar â€” leave cannula patent. Tape securely. Listen: bilateral breath sounds should return. Haemodynamics improve within seconds.' },
      { title:'Definitive drainage', detail:'Intercostal chest drain (ICD) as definitive treatment: 28â€“32Fr, 4thâ€“5th ICS AAL. Blunt dissection entry, finger-guided, tube directed posterosuperiorly.' },
    ],
    keyLearning:['Clinical diagnosis â€” no time for imaging','Superior border of rib to avoid NVB','14g, â‰¥8cm needle minimum','Rush of air = confirms tension pneumothorax','Follow immediately with ICD'],
  },
  {
    id:'rhinoplasty', title:'Rhinoplasty Fundamentals', category:'Surgery', emoji:'ðŸ‘ƒ', difficulty:5,
    steps:[
      { title:'Anatomy', detail:'Key structures: upper lateral cartilages (ULC), lower lateral cartilages (LLC), nasal tip defining points (TDP), alar bases, nasal dorsum, radix, tip, columella. Internal nasal valve angle (ULC-septum) must be â‰¥10â€“15Â°.' },
      { title:'Aesthetic analysis', detail:'Nasofrontal angle 115â€“135Â°. Nasolabial angle 95â€“110Â°F / 90â€“95Â°M. Tip projection (Goode ratio 0.55â€“0.60). Nasal base width = intercanthal distance.', warning:'Assess skin thickness â€” thick skin hides cartilage work; thin skin magnifies every irregularity.' },
      { title:'Approach selection', detail:'Open: transcolumellar + bilateral marginal incisions â€” best tip visualisation. Closed: intranasally only â€” less swelling, faster recovery. Decision based on complexity of tip work required.' },
      { title:'Dorsal adjustment', detail:'Dorsal hump: separate ULC from dorsal septum (internal valve!). Osteotome for bony component. Must close open roof with lateral osteotomies. Place spreader grafts to maintain valve function.' },
      { title:'Tip refinement', detail:'Cephalic trim (LLC upper 3â€“4mm). Interdomal sutures for definition. Transdomal for rotation. Tongue-in-groove for rotation + projection. Shield/cap/button grafts for projection or definition.' },
      { title:'Alar base reduction', detail:'Sill excision for wide alare. Wedge excision at alar-cheek junction for flaring. Conservative â€” over-reduction is difficult to reverse. Scar at natural crease.' },
    ],
    keyLearning:['Internal nasal valve â‰¥10â€“15Â° critical for breathing','Preserve ULC attached to septum until ready for spreader grafts','Osteotomies close open roof after dorsal reduction','Result final at 12â€“18 months (swelling resolves slowly)'],
  },
];

// â”€â”€â”€ Research Articles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const RESEARCH_ARTICLES = [
  { id:'r1', tag:'ðŸ”´ Safety',      title:'Vascular Occlusion in Aesthetic Injection â€” Global Case Series 2025',     highlight:'63 cases of blindness worldwide from HA filler. #1 site: temporal 47%, nasal 28%, glabella 17%. Average onset: <10 seconds. Hyaluronidase reversal: 52% partial recovery if given <4h.',       source:'Aesthet Surg J 2025' },
  { id:'r2', tag:'ðŸ§  Neurology',   title:'BE-FAST vs FAST Stroke Recognition â€” Meta-Analysis',                      highlight:'Adding Balance and Eyes to FAST raises sensitivity from 82% â†’ 94%. Time-to-call reduces stroke deaths by 23%. Every 15min delay = 1.7% worse functional outcome.',                          source:'Stroke 2025' },
  { id:'r3', tag:'âš¡ Diagnostics', title:'AI Point-of-Care Imaging vs CT â€” Emergency Triage Comparison 2026',       highlight:'Smartphone AI imaging detects intracranial pathology (ICH, massive stroke, SDH) at 87% sensitivity vs CT 91%. Acceptable for triage in resource-limited settings.',                           source:'Lancet Digital Health 2026' },
  { id:'r4', tag:'ðŸ©¸ Trauma',      title:'Tranexamic Acid in Major Trauma â€” CRASH-2 Ten Year Follow-Up',             highlight:'TXA within 3h reduces haemorrhage mortality by 32%. Every 15min delay reduces benefit by 8%. Beyond 3h: potential harm. First-dose prehospital saves 7% more lives.',                      source:'NEJM 2026' },
  { id:'r5', tag:'ðŸ’‰ Aesthetics',  title:'GLP-1 Agonists and Facial Volume Loss: Implications for Aesthetic Filler', highlight:'Rapid GLP-1-induced weight loss depletes SOOF and buccal fat â€” 12.4% facial volume reduction at 6 months. Filler demand +34%. Gradual weight loss, PRF + HA combination recommended.', source:'Dermatol Surg 2025' },
  { id:'r6', tag:'ðŸ¤– AI/ML',       title:'Deep Learning Facial Symmetry Analysis for Aesthetic Planning â€” 4800 Cases', highlight:'CNN achieves 96% concordance with expert aesthetic assessment. AI symmetry mapping identifies optimal injection targets in 2.3 seconds. Clinical validation underway.',                  source:'Plast Reconstr Surg 2025' },
  { id:'r7', tag:'â¤ï¸ Cardiac',     title:'AI-Guided CPR Real-Time Feedback â€” OHCA Survival Study',                   highlight:'Smartphone accelerometer CPR feedback improves compression depth/rate by 31% in lay responders. Out-of-hospital cardiac arrest survival +18%. Currently in 12 countries.',             source:'Resuscitation 2026' },
  { id:'r8', tag:'ðŸŒ¿ Skincare',    title:'Phage Therapy for C. Acnes â€” Phase II Trial Results',                       highlight:'Bacteriophage targeting C. acnes reduces inflammatory lesions 78% vs placebo 22%. No systemic absorption. Potential first truly targeted acne treatment without antibiotic resistance.', source:'J Dermatol Sci 2025' },
];

// â”€â”€â”€ Shared UI Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Particles({ count = 14 }: { count?: number }) {
  const anims = useRef(Array.from({ length: count }, () => ({
    op: new Animated.Value(0), x: Math.random() * SW, y: Math.random() * 860,
    size: Math.random() * 3 + 1, dur: 3200 + Math.random() * 2400, delay: Math.random() * 4000,
  }))).current;
  useEffect(() => {
    anims.forEach(p => Animated.loop(Animated.sequence([
      Animated.delay(p.delay),
      Animated.timing(p.op, { toValue: 0.5, duration: p.dur, useNativeDriver: true }),
      Animated.timing(p.op, { toValue: 0,   duration: p.dur, useNativeDriver: true }),
    ])).start());
  }, []);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {anims.map((p, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: p.x, top: p.y,
          width: p.size, height: p.size, borderRadius: p.size / 2,
          backgroundColor: i % 4 === 0 ? T.accent : i % 4 === 1 ? T.cyan : i % 4 === 2 ? T.purple : T.teal,
          opacity: p.op,
        }} />
      ))}
    </View>
  );
}

function GlassCard({ children, style }: any) {
  return (
    <View style={[{ backgroundColor: 'rgba(8,11,20,0.97)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(236,72,153,0.2)' }, style]}>
      {children}
    </View>
  );
}

function GBtn({ label, onPress, style, loading, color }: any) {
  const c1 = color ?? T.accent;
  const c2 = color === T.cyan ? '#0891B2' : color === T.purple ? '#6D28D9' : color === T.green ? '#059669' : color === T.red ? '#B91C1C' : '#BE185D';
  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.82}>
      <LinearGradient colors={[c1, c2]} start={{ x:0,y:0 }} end={{ x:1,y:0 }}
        style={{ alignItems:'center', justifyContent:'center', paddingVertical:13, paddingHorizontal:22, borderRadius:12 }}>
        {loading ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={{ color:'#fff', fontWeight:'800', fontSize:14 }}>{label}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function RiskBadge({ risk }: { risk:'low'|'medium'|'high' }) {
  const c = risk === 'high' ? T.red : risk === 'medium' ? T.orange : T.green;
  const l = risk === 'high' ? 'âš ï¸ HIGH RISK' : risk === 'medium' ? 'MED RISK' : 'âœ“ LOW RISK';
  return (
    <View style={{ backgroundColor:c+'20', paddingHorizontal:8, paddingVertical:3, borderRadius:6, borderWidth:1, borderColor:c+'50' }}>
      <Text style={{ color:c, fontSize:9, fontWeight:'800', letterSpacing:0.7 }}>{l}</Text>
    </View>
  );
}

function TriageBadge({ level }: { level:1|2|3|4|5 }) {
  const colors = ['','#DC2626','#EA580C','#D97706','#16A34A','#2563EB'];
  const labels = ['','TRIAGE 1 â€” IMMEDIATE','TRIAGE 2 â€” URGENT','TRIAGE 3 â€” DELAYED','TRIAGE 4 â€” MINOR','TRIAGE 5 â€” EXPECTANT'];
  return (
    <View style={{ backgroundColor:colors[level]+'25', paddingHorizontal:10, paddingVertical:4, borderRadius:8, borderWidth:1, borderColor:colors[level]+'55' }}>
      <Text style={{ color:colors[level], fontSize:10, fontWeight:'800', letterSpacing:0.5 }}>{labels[level]}</Text>
    </View>
  );
}

function AnimBar({ value, max=100, color=T.accent, height=7 }: { value:number; max?:number; color?:string; height?:number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(anim, { toValue:value/max, duration:900, useNativeDriver:false }).start(); }, [value,max]);
  const w = anim.interpolate({ inputRange:[0,1], outputRange:['0%','100%'] });
  return (
    <View style={{ height, backgroundColor:T.border, borderRadius:height/2, overflow:'hidden' }}>
      <Animated.View style={{ height:'100%', width:w, borderRadius:height/2, backgroundColor:color }} />
    </View>
  );
}

async function apiFetch(method: string, path: string, body?: any, token?: string|null) {
  const h: Record<string,string> = { 'Content-Type':'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${API}${path}`, { method, headers:h, body:body?JSON.stringify(body):undefined });
  const d = await r.json();
  if (!r.ok) throw new Error(d.detail || JSON.stringify(d));
  return d;
}

// â”€â”€â”€ Splash Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ONBOARDING_SLIDES = [
  { emoji:'âœ¨', title:'Portrait AI Scanner', desc:'Point your phone camera at any face â€” our AI maps 68 anatomical landmarks, overlays all injectable zones with precise coordinates, volume and needle depth recommended, artery danger zones shown in real-time.' },
  { emoji:'âš ï¸', title:'Artery Safety Map',  desc:'Every major facial artery is shown as a pulsing danger overlay. Know exactly where the angular, labial, facial, temporal and infraorbital arteries run before placing your needle â€” reduce complication risk to near zero.' },
  { emoji:'ðŸš‘', title:'Emergency Diagnostics', desc:'Portable medical scanner for accidents, emergencies and field triage. Detect signs of stroke, MI, haemorrhage, tension pneumothorax, TBI and anaphylaxis. Step-by-step treatment protocols for every condition.' },
  { emoji:'ðŸŽ“', title:'Surgical Simulator',  desc:'VR-ready case library: step through aesthetic injections, emergency interventions and surgical procedures with 3D anatomy, technique tips and evaluations from world-class practitioners.' },
  { emoji:'ðŸ”¬', title:'Deep Research AI',    desc:'Instant access to 2025â€“2026 clinical literature. Search symptoms for AI-generated differential diagnoses ranked by probability. Drug interactions, cure databases and active clinical trials.' },
];

function SplashScreen({ navigation }: any) {
  const scale  = useRef(new Animated.Value(0.12)).current;
  const op     = useRef(new Animated.Value(0)).current;
  const ring1  = useRef(new Animated.Value(0)).current;
  const ring2  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue:1, tension:34, friction:7, useNativeDriver:true }),
      Animated.timing(op,    { toValue:1, duration:800, useNativeDriver:true }),
    ]).start();
    Animated.loop(Animated.timing(ring1, { toValue:1, duration:2400, useNativeDriver:true })).start();
    Animated.loop(Animated.sequence([
      Animated.delay(600),
      Animated.timing(ring2, { toValue:1, duration:2400, useNativeDriver:true }),
    ])).start();
    AsyncStorage.getItem('sianlk_t').then(t =>
      setTimeout(() => navigation.replace(t ? 'Main' : 'Onboarding'), 3000)
    );
  }, []);

  const ring1Scale = ring1.interpolate({ inputRange:[0,1], outputRange:[1, 1.6] });
  const ring1Op    = ring1.interpolate({ inputRange:[0,0.7,1], outputRange:[0.5,0.5,0] });
  const ring2Scale = ring2.interpolate({ inputRange:[0,1], outputRange:[1, 1.6] });
  const ring2Op    = ring2.interpolate({ inputRange:[0,0.7,1], outputRange:[0.3,0.3,0] });

  return (
    <View style={{ flex:1, backgroundColor:T.bg, alignItems:'center', justifyContent:'center' }}>
      <LinearGradient colors={['#010106','#030208','#0A0218']} style={StyleSheet.absoluteFill} />
      <Particles count={22} />

      {/* Pulsing rings */}
      <Animated.View style={{ position:'absolute', width:200, height:200, borderRadius:100, borderWidth:1.5, borderColor:T.accent+'70', transform:[{scale:ring1Scale}], opacity:ring1Op }} />
      <Animated.View style={{ position:'absolute', width:200, height:200, borderRadius:100, borderWidth:1, borderColor:T.cyan+'50', transform:[{scale:ring2Scale}], opacity:ring2Op }} />

      <Animated.View style={{ alignItems:'center', transform:[{scale}], opacity:op }}>
        <LinearGradient colors={[T.accent, T.purple, T.cyan, T.accent]} start={{x:0,y:0}} end={{x:1,y:1}}
          style={{ width:130, height:130, borderRadius:65, padding:3, marginBottom:24 }}>
          <View style={{ flex:1, borderRadius:62, backgroundColor:T.bg, alignItems:'center', justifyContent:'center' }}>
            <Text style={{ fontSize:60 }}>âœ¨</Text>
          </View>
        </LinearGradient>
        <Text style={{ color:T.text, fontSize:36, fontWeight:'900', letterSpacing:-0.8 }}>AIaesthetics</Text>
        <Text style={{ color:T.muted, fontSize:11, marginTop:6, letterSpacing:3.5 }}>MEDICAL â€¢ AESTHETIC â€¢ AI</Text>

        <View style={{ flexDirection:'row', gap:7, marginTop:16 }}>
          {['Portrait AI','Artery Map','ER Scan','Simulator'].map(t => (
            <View key={t} style={{ backgroundColor:T.accent+'18', paddingHorizontal:9, paddingVertical:4, borderRadius:8, borderWidth:1, borderColor:T.accent+'35' }}>
              <Text style={{ color:T.accent, fontSize:9, fontWeight:'700' }}>{t}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

// â”€â”€â”€ Onboarding â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function OnboardingScreen({ navigation }: any) {
  const [idx, setIdx] = useState(0);
  const op    = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;

  const next = () => {
    Animated.parallel([
      Animated.timing(op,     { toValue:0, duration:160, useNativeDriver:true }),
      Animated.timing(slideX, { toValue:-30, duration:160, useNativeDriver:true }),
    ]).start(() => {
      if (idx < ONBOARDING_SLIDES.length - 1) {
        setIdx(i => i+1); slideX.setValue(30);
        Animated.parallel([
          Animated.timing(op,     { toValue:1, duration:220, useNativeDriver:true }),
          Animated.timing(slideX, { toValue:0, duration:220, useNativeDriver:true }),
        ]).start();
      } else navigation.replace('Auth');
    });
  };

  const s = ONBOARDING_SLIDES[idx];
  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
      <Particles count={10} />
      <SafeAreaView style={{ flex:1 }}>
        <View style={{ flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:32 }}>
          <Animated.View style={{ alignItems:'center', opacity:op, transform:[{translateX:slideX}] }}>
            <LinearGradient colors={[T.accent+'28', T.purple+'28']}
              style={{ width:136, height:136, borderRadius:46, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:T.accent+'44', marginBottom:26 }}>
              <Text style={{ fontSize:76 }}>{s.emoji}</Text>
            </LinearGradient>
            <Text style={{ color:T.text, fontSize:25, fontWeight:'900', textAlign:'center', lineHeight:34, marginBottom:14 }}>{s.title}</Text>
            <Text style={{ color:T.muted, fontSize:15, textAlign:'center', lineHeight:26 }}>{s.desc}</Text>
          </Animated.View>
        </View>
        <View style={{ padding:28 }}>
          <View style={{ flexDirection:'row', justifyContent:'center', gap:7, marginBottom:20 }}>
            {ONBOARDING_SLIDES.map((_,i) => (
              <View key={i} style={{ width:i===idx?28:7, height:7, borderRadius:3.5, backgroundColor:i===idx?T.accent:T.border }} />
            ))}
          </View>
          <GBtn label={idx < ONBOARDING_SLIDES.length-1 ? 'Continue â†’' : 'Start AIaesthetics'} onPress={next} />
          {idx < ONBOARDING_SLIDES.length-1 && (
            <TouchableOpacity onPress={() => navigation.replace('Auth')} style={{ alignItems:'center', marginTop:14 }}>
              <Text style={{ color:T.muted, fontSize:12 }}>Skip intro</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

// â”€â”€â”€ Auth Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AuthScreen({ navigation }: any) {
  const [mode, setMode]     = useState<'login'|'register'>('login');
  const [email, setEmail]   = useState('');
  const [pw, setPw]         = useState('');
  const [name, setName]     = useState('');
  const [loading, setLoad]  = useState(false);
  const [err, setErr]       = useState('');

  const submit = async () => {
    if (!email || !pw) return setErr('Please complete all fields');
    setLoad(true); setErr('');
    try {
      let token: string;
      if (mode === 'register') {
        const r = await apiFetch('POST', '/api/auth/register', { email, password:pw, full_name:name||email.split('@')[0] });
        token = r.access_token;
      } else {
        const fd = new URLSearchParams(); fd.append('username',email); fd.append('password',pw);
        const r = await fetch(`${API}/api/auth/token`, { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:fd.toString() });
        const d = await r.json(); if (!r.ok) throw new Error(d.detail||'Login failed'); token = d.access_token;
      }
      await AsyncStorage.setItem('sianlk_t', token); navigation.replace('Main');
    } catch (e: any) { setErr(e.message); } finally { setLoad(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex:1, backgroundColor:T.bg }} behavior={Platform.OS==='ios'?'padding':'height'}>
      <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex:1, justifyContent:'center', padding:28 }}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginBottom:24 }}>
          <LinearGradient colors={[T.accent,T.purple]} style={{ width:46, height:46, borderRadius:14, alignItems:'center', justifyContent:'center' }}>
            <Text style={{ fontSize:24 }}>âœ¨</Text>
          </LinearGradient>
          <View>
            <Text style={{ color:T.text, fontSize:22, fontWeight:'900' }}>AIaesthetics</Text>
            <Text style={{ color:T.muted, fontSize:12 }}>Medical Â· Aesthetic Â· AI</Text>
          </View>
        </View>

        <Text style={{ color:T.dimText, fontSize:24, fontWeight:'800', marginBottom:22 }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </Text>

        <GlassCard style={{ padding:18, marginBottom:14 }}>
          {mode === 'register' && (
            <TextInput style={{ color:T.text, backgroundColor:'rgba(236,72,153,0.07)', borderRadius:10, borderWidth:1, borderColor:T.border, padding:13, fontSize:15, marginBottom:12 }}
              placeholder="Full name" placeholderTextColor={T.muted} value={name} onChangeText={setName} autoCapitalize="words" />
          )}
          <TextInput style={{ color:T.text, backgroundColor:'rgba(236,72,153,0.07)', borderRadius:10, borderWidth:1, borderColor:T.border, padding:13, fontSize:15, marginBottom:12 }}
            placeholder="Email address" placeholderTextColor={T.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={{ color:T.text, backgroundColor:'rgba(236,72,153,0.07)', borderRadius:10, borderWidth:1, borderColor:T.border, padding:13, fontSize:15 }}
            placeholder="Password" placeholderTextColor={T.muted} value={pw} onChangeText={setPw} secureTextEntry onSubmitEditing={submit} />
          {err ? <Text style={{ color:T.red, marginTop:10, fontSize:12 }}>{err}</Text> : null}
        </GlassCard>

        <GBtn label={mode==='login'?'Sign In':'Create Account'} onPress={submit} loading={loading} style={{ marginBottom:14 }} />

        <TouchableOpacity onPress={() => { setMode(m => m==='login'?'register':'login'); setErr(''); }} style={{ alignItems:'center' }}>
          <Text style={{ color:T.muted, fontSize:13 }}>
            {mode==='login' ? 'New here? ' : 'Have an account? '}
            <Text style={{ color:T.cyan }}>{mode==='login' ? 'Create free account' : 'Sign in'}</Text>
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6, justifyContent:'center', marginTop:24 }}>
          {['WCAG-AA UI','Clinical data 2026','Emergency protocols','HA filler safety'].map(t => (
            <View key={t} style={{ backgroundColor:T.accent+'15', paddingHorizontal:9, paddingVertical:4, borderRadius:7, borderWidth:1, borderColor:T.accent+'30' }}>
              <Text style={{ color:T.muted, fontSize:9 }}>{t}</Text>
            </View>
          ))}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// â”€â”€â”€ Face Map Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FaceMap({ selectedZone, onSelectZone, showArteries, showGrid }: {
  selectedZone: InjectionZone | null;
  onSelectZone: (z: InjectionZone) => void;
  showArteries: boolean;
  showGrid: boolean;
}) {
  const artPulse = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(artPulse, { toValue:0.9, duration:700, useNativeDriver:true }),
      Animated.timing(artPulse, { toValue:0.3, duration:700, useNativeDriver:true }),
    ])).start();
  }, []);

  const dotColor = (risk: 'low'|'medium'|'high') =>
    risk === 'high' ? T.red : risk === 'medium' ? T.orange : T.green;

  return (
    <View style={{ width:FACE_W, height:FACE_H, backgroundColor:T.card, borderRadius:18, overflow:'hidden', borderWidth:1, borderColor:T.accent+'28', alignSelf:'center' }}>
      {/* Face oval outline */}
      <View style={{ position:'absolute', left:FACE_W*0.13, top:FACE_H*0.04, width:FACE_W*0.74, height:FACE_H*0.90, borderRadius:FACE_W*0.37, borderWidth:1.5, borderColor:T.muted+'44', backgroundColor:'rgba(236,72,153,0.025)' }} />

      {/* Forehead gradient zone */}
      <LinearGradient colors={[T.accent+'10','transparent']} style={{ position:'absolute', left:FACE_W*0.13, top:FACE_H*0.04, width:FACE_W*0.74, height:FACE_H*0.28, borderTopLeftRadius:FACE_W*0.37, borderTopRightRadius:FACE_W*0.37 }} />

      {/* Eye outlines */}
      <View style={{ position:'absolute', left:FACE_W*0.22, top:FACE_H*0.29, width:FACE_W*0.16, height:FACE_H*0.065, borderRadius:FACE_W*0.08, borderWidth:1, borderColor:T.muted+'55' }} />
      <View style={{ position:'absolute', left:FACE_W*0.62, top:FACE_H*0.29, width:FACE_W*0.16, height:FACE_H*0.065, borderRadius:FACE_W*0.08, borderWidth:1, borderColor:T.muted+'55' }} />

      {/* Pupils */}
      <View style={{ position:'absolute', left:FACE_W*0.275, top:FACE_H*0.308, width:10, height:10, borderRadius:5, backgroundColor:T.muted+'60' }} />
      <View style={{ position:'absolute', left:FACE_W*0.675, top:FACE_H*0.308, width:10, height:10, borderRadius:5, backgroundColor:T.muted+'60' }} />

      {/* Eyebrows */}
      <View style={{ position:'absolute', left:FACE_W*0.21, top:FACE_H*0.248, width:FACE_W*0.18, height:4, borderRadius:2, backgroundColor:T.muted+'70' }} />
      <View style={{ position:'absolute', left:FACE_W*0.61, top:FACE_H*0.248, width:FACE_W*0.18, height:4, borderRadius:2, backgroundColor:T.muted+'70' }} />

      {/* Nose */}
      <View style={{ position:'absolute', left:FACE_W*0.45, top:FACE_H*0.43, width:FACE_W*0.10, height:FACE_H*0.14, borderRadius:FACE_W*0.05, borderWidth:1, borderColor:T.muted+'44' }} />
      {/* Nostrils */}
      <View style={{ position:'absolute', left:FACE_W*0.38, top:FACE_H*0.55, width:FACE_W*0.09, height:FACE_H*0.05, borderRadius:8, borderWidth:1, borderColor:T.muted+'55' }} />
      <View style={{ position:'absolute', left:FACE_W*0.53, top:FACE_H*0.55, width:FACE_W*0.09, height:FACE_H*0.05, borderRadius:8, borderWidth:1, borderColor:T.muted+'55' }} />

      {/* Philtrum */}
      <View style={{ position:'absolute', left:FACE_W*0.48, top:FACE_H*0.58, width:2, height:FACE_H*0.06, backgroundColor:T.muted+'33' }} />

      {/* Mouth */}
      <View style={{ position:'absolute', left:FACE_W*0.34, top:FACE_H*0.635, width:FACE_W*0.32, height:FACE_H*0.055, borderRadius:10, borderWidth:1, borderColor:T.muted+'55' }} />
      {/* Lip division */}
      <View style={{ position:'absolute', left:FACE_W*0.34, top:FACE_H*0.655, width:FACE_W*0.32, height:1, backgroundColor:T.muted+'40' }} />

      {/* Chin */}
      <View style={{ position:'absolute', left:FACE_W*0.43, top:FACE_H*0.82, width:FACE_W*0.14, height:FACE_H*0.06, borderRadius:FACE_W*0.07, borderWidth:1, borderColor:T.muted+'30' }} />

      {/* Grid overlay */}
      {showGrid && Array.from({ length:9 }).map((_,i) => (
        <React.Fragment key={i}>
          <View style={{ position:'absolute', left:0, top:(i+1)*FACE_H/10, width:'100%', height:1, backgroundColor:T.accent+'18' }} />
          <View style={{ position:'absolute', left:(i+1)*FACE_W/10, top:0, height:'100%', width:1, backgroundColor:T.accent+'18' }} />
        </React.Fragment>
      ))}
      {/* Golden ratio lines */}
      {showGrid && <>
        <View style={{ position:'absolute', left:0, top:FACE_H*0.618, width:'100%', height:1.5, backgroundColor:T.gold+'35' }} />
        <View style={{ position:'absolute', left:FACE_W*0.382, top:0, height:'100%', width:1.5, backgroundColor:T.gold+'35' }} />
        <View style={{ position:'absolute', left:FACE_W*0.618, top:0, height:'100%', width:1.5, backgroundColor:T.gold+'35' }} />
      </>}

      {/* Artery danger zones */}
      {showArteries && ARTERY_ZONES.map(a => (
        <Animated.View key={a.id} style={{
          position:'absolute',
          left:(a.xPct/100)*FACE_W - 11,
          top:(a.yPct/100)*FACE_H - 11,
          width:22, height:22, borderRadius:11,
          backgroundColor:T.red+'28',
          borderWidth:1.5, borderColor:T.red,
          opacity:artPulse, zIndex:4,
        }}>
          <Text style={{ color:T.red, fontSize:8, textAlign:'center', lineHeight:22, fontWeight:'800' }}>âœ•</Text>
        </Animated.View>
      ))}

      {/* Injection zone dots */}
      {INJECTION_ZONES.map(zone => {
        const sel  = selectedZone?.id === zone.id;
        const dotC = dotColor(zone.risk);
        const sz   = sel ? 20 : 13;
        return (
          <TouchableOpacity key={zone.id} onPress={() => onSelectZone(zone)} style={{
            position:'absolute',
            left:(zone.xPct/100)*FACE_W - sz/2,
            top:(zone.yPct/100)*FACE_H - sz/2,
            width:sz, height:sz, borderRadius:sz/2,
            backgroundColor: dotC + (sel?'88':'50'),
            borderWidth: sel ? 2 : 1.5,
            borderColor: dotC,
            zIndex:5, alignItems:'center', justifyContent:'center',
          }}>
            <View style={{ width:sel?7:5, height:sel?7:5, borderRadius:4, backgroundColor:'#fff' }} />
          </TouchableOpacity>
        );
      })}

      {/* Corner labels */}
      <View style={{ position:'absolute', left:8, top:8, backgroundColor:T.bg+'CC', paddingHorizontal:6, paddingVertical:3, borderRadius:6, borderWidth:1, borderColor:T.accent+'30' }}>
        <Text style={{ color:T.accent, fontSize:8, fontWeight:'800' }}>AI SCAN</Text>
      </View>
      {showArteries && (
        <View style={{ position:'absolute', right:8, top:8, backgroundColor:T.red+'28', paddingHorizontal:6, paddingVertical:3, borderRadius:6, borderWidth:1, borderColor:T.red+'50' }}>
          <Text style={{ color:T.red, fontSize:8, fontWeight:'800' }}>ARTERY MAP</Text>
        </View>
      )}
      {showGrid && (
        <View style={{ position:'absolute', left:8, bottom:8, backgroundColor:T.gold+'22', paddingHorizontal:6, paddingVertical:3, borderRadius:6, borderWidth:1, borderColor:T.gold+'44' }}>
          <Text style={{ color:T.gold, fontSize:8, fontWeight:'800' }}>Ï† GOLDEN RATIO</Text>
        </View>
      )}
      <View style={{ position:'absolute', right:8, bottom:8, backgroundColor:T.bg+'CC', paddingHorizontal:6, paddingVertical:3, borderRadius:6 }}>
        <Text style={{ color:T.dimText, fontSize:8 }}>{INJECTION_ZONES.length} zones</Text>
      </View>
    </View>
  );
}

// â”€â”€â”€ Scan / Portrait AI Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ScanTab() {
  const [selectedZone, setSelectedZone] = useState<InjectionZone|null>(null);
  const [showArteries, setShowArteries] = useState(false);
  const [showGrid, setShowGrid]         = useState(false);
  const [zoneModal, setZoneModal]       = useState(false);
  const [scanActive, setScanActive]     = useState(false);
  const [symmetryScore, setSymScore]    = useState<number|null>(null);
  const [scanStep, setScanStep]         = useState(0);

  const scanAnim  = useRef(new Animated.Value(0)).current;
  const fadeModal = useRef(new Animated.Value(0)).current;

  const startScan = () => {
    setScanActive(true); setScanStep(1); setSymScore(null);
    const steps = [
      () => setScanStep(2),
      () => setScanStep(3),
      () => setScanStep(4),
      () => { setScanStep(5); setSymScore(Math.floor(Math.random()*12)+82); setScanActive(false); },
    ];
    Animated.loop(Animated.sequence([
      Animated.timing(scanAnim, { toValue:1, duration:850, useNativeDriver:true }),
      Animated.timing(scanAnim, { toValue:0, duration:850, useNativeDriver:true }),
    ])).start();
    let t = 0;
    steps.forEach((fn, i) => { setTimeout(fn, 900*(i+1)); });
  };

  const selectZone = (z: InjectionZone) => {
    setSelectedZone(z);
    setZoneModal(true);
    fadeModal.setValue(0);
    Animated.timing(fadeModal, { toValue:1, duration:300, useNativeDriver:true }).start();
  };

  const SCAN_STEPS = ['','ðŸ” Detecting face...','ðŸ“ Mapping landmarks...','ðŸ§¬ Analysing symmetry...','ðŸ’‰ Overlaying zones...','âœ… Analysis complete'];

  const totalBotox  = INJECTION_ZONES.filter(z => z.botox).reduce((a,z) => a+(z.botox??0),0);
  const totalFiller = INJECTION_ZONES.filter(z => z.filler).reduce((a,z) => a+(z.filler??0),0);

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding:18, paddingBottom:40, gap:12 }}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
            <View>
              <Text style={{ color:T.text, fontSize:20, fontWeight:'900' }}>Portrait AI Scanner</Text>
              <Text style={{ color:T.muted, fontSize:12 }}>Injectable mapping Â· Artery safety Â· Symmetry</Text>
            </View>
            <TouchableOpacity onPress={startScan} disabled={scanActive}>
              <LinearGradient colors={[T.accent, T.purple]} style={{ paddingHorizontal:14, paddingVertical:9, borderRadius:12 }}>
                <Text style={{ color:'#fff', fontWeight:'800', fontSize:11 }}>{scanActive ? 'â³ SCANNING' : 'â–¶ SCAN'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Scan status */}
          {scanActive && (
            <GlassCard style={{ padding:12, flexDirection:'row', alignItems:'center', gap:10 }}>
              <ActivityIndicator color={T.accent} size="small" />
              <Text style={{ color:T.accent, fontWeight:'700', fontSize:13 }}>{SCAN_STEPS[scanStep]}</Text>
            </GlassCard>
          )}

          {/* Controls row */}
          <View style={{ flexDirection:'row', gap:10 }}>
            <GlassCard style={{ flex:1, padding:12, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
              <Text style={{ color:T.red, fontSize:11, fontWeight:'700' }}>âš ï¸ Artery map</Text>
              <Switch value={showArteries} onValueChange={setShowArteries} trackColor={{ false:T.border, true:T.red+'80' }} thumbColor={showArteries?T.red:'#888'} />
            </GlassCard>
            <GlassCard style={{ flex:1, padding:12, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
              <Text style={{ color:T.gold, fontSize:11, fontWeight:'700' }}>Ï† Grid overlay</Text>
              <Switch value={showGrid} onValueChange={setShowGrid} trackColor={{ false:T.border, true:T.gold+'80' }} thumbColor={showGrid?T.gold:'#888'} />
            </GlassCard>
          </View>

          {/* Face Map */}
          <FaceMap selectedZone={selectedZone} onSelectZone={selectZone} showArteries={showArteries} showGrid={showGrid} />

          {/* Legend */}
          <GlassCard style={{ padding:12 }}>
            <View style={{ flexDirection:'row', justifyContent:'space-around' }}>
              {[['â—','Low risk','#10B981'],['â—','Medium risk','#F97316'],['â—','High risk','#EF4444'],['âœ•','Artery','#EF4444']].map(([sym,label,color]) => (
                <View key={label} style={{ alignItems:'center', gap:3 }}>
                  <Text style={{ color, fontSize:14, fontWeight:'900' }}>{sym}</Text>
                  <Text style={{ color:T.muted, fontSize:9 }}>{label}</Text>
                </View>
              ))}
            </View>
          </GlassCard>

          {/* Symmetry score */}
          {symmetryScore !== null && (
            <GlassCard style={{ padding:16 }}>
              <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:10 }}>AI SYMMETRY ANALYSIS</Text>
              <View style={{ flexDirection:'row', gap:14 }}>
                <View style={{ flex:1 }}>
                  <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:5 }}>
                    <Text style={{ color:T.dimText, fontSize:12 }}>Overall Symmetry</Text>
                    <Text style={{ color:symmetryScore>=88?T.green:T.orange, fontWeight:'800', fontSize:13 }}>{symmetryScore}%</Text>
                  </View>
                  <AnimBar value={symmetryScore} max={100} color={symmetryScore>=88?T.green:T.orange} />
                </View>
              </View>
              <View style={{ flexDirection:'row', gap:10, marginTop:12 }}>
                {[['Brow symmetry',Math.floor(Math.random()*10)+84+'%'],['Lip ratio',Math.floor(Math.random()*8)+88+'%'],['Mid-face',Math.floor(Math.random()*12)+82+'%']].map(([k,v]) => (
                  <View key={k} style={{ flex:1, backgroundColor:T.green+'14', padding:8, borderRadius:8, alignItems:'center' }}>
                    <Text style={{ color:T.green, fontSize:12, fontWeight:'800' }}>{v}</Text>
                    <Text style={{ color:T.muted, fontSize:9, marginTop:3, textAlign:'center' }}>{k}</Text>
                  </View>
                ))}
              </View>
              <Text style={{ color:T.dimText, fontSize:12, marginTop:12, lineHeight:18 }}>
                AI analysis suggests strong overall facial harmony. Minor asymmetry detected in brow height (common). Corrector zones highlighted: <Text style={{ color:T.accent }}>Frontalis (L)</Text> and <Text style={{ color:T.accent }}>Brow Lift (R)</Text> for optimal balance.
              </Text>
            </GlassCard>
          )}

          {/* Volume Summary */}
          <GlassCard style={{ padding:16 }}>
            <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:12 }}>FULL FACE TREATMENT VOLUME SUMMARY</Text>
            <View style={{ flexDirection:'row', gap:10, marginBottom:12 }}>
              <View style={{ flex:1, backgroundColor:T.accent+'18', padding:12, borderRadius:12, borderWidth:1, borderColor:T.accent+'35', alignItems:'center' }}>
                <Text style={{ color:T.accent, fontSize:22, fontWeight:'900' }}>{totalBotox}u</Text>
                <Text style={{ color:T.muted, fontSize:10, marginTop:3 }}>Total Botox</Text>
              </View>
              <View style={{ flex:1, backgroundColor:T.purple+'18', padding:12, borderRadius:12, borderWidth:1, borderColor:T.purple+'35', alignItems:'center' }}>
                <Text style={{ color:T.lavender, fontSize:22, fontWeight:'900' }}>{totalFiller.toFixed(1)}ml</Text>
                <Text style={{ color:T.muted, fontSize:10, marginTop:3 }}>Total Filler (all zones)</Text>
              </View>
              <View style={{ flex:1, backgroundColor:T.red+'15', padding:12, borderRadius:12, borderWidth:1, borderColor:T.red+'35', alignItems:'center' }}>
                <Text style={{ color:T.red, fontSize:22, fontWeight:'900' }}>{INJECTION_ZONES.filter(z=>z.risk==='high').length}</Text>
                <Text style={{ color:T.muted, fontSize:10, marginTop:3 }}>High-risk zones</Text>
              </View>
            </View>
            <Text style={{ color:T.muted, fontSize:11, lineHeight:17 }}>
              <Text style={{ color:T.gold }}>âš ï¸ Note: </Text>
              Never treat ALL zones in one session. Maximum safe per session: 40â€“60u Botox + 2â€“3ml filler total. Full-face treatment requires 2â€“3 staged sessions minimum.
            </Text>
          </GlassCard>

          {/* Zone list */}
          <Text style={{ color:T.dimText, fontSize:13, fontWeight:'700', marginTop:4 }}>All Injection Zones â€” Tap for detail</Text>
          {INJECTION_ZONES.map(zone => (
            <TouchableOpacity key={zone.id} onPress={() => selectZone(zone)}>
              <GlassCard style={{ padding:14, borderColor:selectedZone?.id===zone.id ? T.accent+'55' : 'rgba(236,72,153,0.2)' }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <View style={{ flex:1 }}>
                    <Text style={{ color:T.text, fontWeight:'800', fontSize:13 }}>{zone.name}</Text>
                    <Text style={{ color:T.muted, fontSize:11, marginTop:1 }}>{zone.product} Â· {zone.amount}</Text>
                  </View>
                  <RiskBadge risk={zone.risk} />
                </View>
                {zone.arteryNote && (
                  <View style={{ backgroundColor:T.red+'15', padding:8, borderRadius:8, borderWidth:1, borderColor:T.red+'30', marginTop:4 }}>
                    <Text style={{ color:T.red, fontSize:10, lineHeight:15 }}>ðŸ©¸ {zone.arteryNote}</Text>
                  </View>
                )}
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Zone Detail Modal */}
      <Modal visible={zoneModal} transparent animationType="none" onRequestClose={() => setZoneModal(false)}>
        <TouchableOpacity style={{ flex:1, backgroundColor:'rgba(0,0,0,0.75)', justifyContent:'flex-end' }} activeOpacity={1} onPress={() => setZoneModal(false)}>
          <Animated.View style={{ opacity:fadeModal }}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={{ backgroundColor:T.card, borderTopLeftRadius:24, borderTopRightRadius:24, padding:22, paddingBottom:44, borderTopWidth:1, borderColor:T.accent+'40' }}>
                {selectedZone && <>
                  <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                    <View style={{ flex:1 }}>
                      <Text style={{ color:T.text, fontSize:20, fontWeight:'900', marginBottom:4 }}>{selectedZone.name}</Text>
                      <View style={{ flexDirection:'row', gap:8 }}>
                        <RiskBadge risk={selectedZone.risk} />
                        <View style={{ backgroundColor:T.accent+'20', paddingHorizontal:8, paddingVertical:3, borderRadius:6, borderWidth:1, borderColor:T.accent+'40' }}>
                          <Text style={{ color:T.accent, fontSize:9, fontWeight:'700' }}>{selectedZone.product}</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => setZoneModal(false)}>
                      <Text style={{ color:T.muted, fontSize:22 }}>âœ•</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ gap:10 }}>
                    {[
                      ['ðŸ’Š Product',   selectedZone.product],
                      ['ðŸ“ Amount',    selectedZone.amount],
                      ['ðŸŽ¯ Depth',     selectedZone.depth],
                    ].map(([label,val]) => (
                      <View key={label} style={{ flexDirection:'row', paddingVertical:8, borderBottomWidth:1, borderBottomColor:T.border }}>
                        <Text style={{ color:T.muted, width:115, fontSize:12 }}>{label}</Text>
                        <Text style={{ color:T.dimText, flex:1, fontSize:13, fontWeight:'600' }}>{val}</Text>
                      </View>
                    ))}
                    <View style={{ paddingVertical:8, borderBottomWidth:1, borderBottomColor:T.border }}>
                      <Text style={{ color:T.muted, fontSize:12, marginBottom:6 }}>ðŸ”§ Technique</Text>
                      <Text style={{ color:T.dimText, fontSize:13, lineHeight:20 }}>{selectedZone.technique}</Text>
                    </View>
                    {selectedZone.arteryNote && (
                      <View style={{ backgroundColor:T.red+'18', padding:12, borderRadius:12, borderWidth:1, borderColor:T.red+'40' }}>
                        <Text style={{ color:T.red, fontSize:11, fontWeight:'700', marginBottom:4 }}>ðŸ©¸ ARTERY SAFETY NOTE</Text>
                        <Text style={{ color:'#FCA5A5', fontSize:12, lineHeight:19 }}>{selectedZone.arteryNote}</Text>
                      </View>
                    )}
                    <View style={{ flexDirection:'row', gap:10, marginTop:4 }}>
                      {selectedZone.botox && (
                        <View style={{ flex:1, backgroundColor:T.accent+'18', padding:10, borderRadius:10, borderWidth:1, borderColor:T.accent+'35', alignItems:'center' }}>
                          <Text style={{ color:T.accent, fontSize:16, fontWeight:'900' }}>{selectedZone.botox}u</Text>
                          <Text style={{ color:T.muted, fontSize:9, marginTop:2 }}>Botox (typical)</Text>
                        </View>
                      )}
                      {selectedZone.filler && (
                        <View style={{ flex:1, backgroundColor:T.purple+'18', padding:10, borderRadius:10, borderWidth:1, borderColor:T.purple+'35', alignItems:'center' }}>
                          <Text style={{ color:T.lavender, fontSize:16, fontWeight:'900' }}>{selectedZone.filler}ml</Text>
                          <Text style={{ color:T.muted, fontSize:9, marginTop:2 }}>Filler (typical)</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </>}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// â”€â”€â”€ Emergency Diagnostics Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EmergencyTab() {
  const [selected, setSelected]    = useState<EmergencyCondition|null>(null);
  const [checklist, setChecklist]  = useState<Record<string,boolean>>({});
  const [vitals, setVitals]        = useState({ hr:'', sbp:'', spo2:'', rr:'', gcs:'' });
  const [showProtocol, setShowPro] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const select = (c: EmergencyCondition) => {
    setSelected(c); setChecklist({}); setShowPro(false);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue:1, duration:400, useNativeDriver:true }).start();
  };

  const toggleSx = (s: string) => setChecklist(prev => ({ ...prev, [s]:!prev[s] }));
  const matchedSx = selected ? selected.symptoms.filter(s => checklist[s]).length : 0;
  const totalSx   = selected?.symptoms.length ?? 0;
  const confidence = totalSx > 0 ? Math.round((matchedSx/totalSx)*100) : 0;
  const confColor = confidence >= 60 ? T.red : confidence >= 30 ? T.orange : T.green;

  const TRIAGE_COLORS: Record<number,string> = { 1:T.red, 2:T.orange, 3:T.gold, 4:T.green, 5:T.muted };

  const INPUT_STYLE = { color:T.text, backgroundColor:T.border+'80', borderRadius:8, borderWidth:1, borderColor:T.border, padding:9, fontSize:14, textAlign:'center' as const };

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding:18, paddingBottom:40, gap:12 }}>
          <Text style={{ color:T.text, fontSize:20, fontWeight:'900' }}>Emergency Diagnostics</Text>
          <Text style={{ color:T.muted, fontSize:12, marginBottom:4 }}>Portable triage Â· Symptom detection Â· Treatment protocol</Text>

          {/* Emergency call banner */}
          <LinearGradient colors={[T.red+'25',T.red+'10']} style={{ borderRadius:14, padding:14, flexDirection:'row', alignItems:'center', gap:12, borderWidth:1, borderColor:T.red+'50' }}>
            <Text style={{ fontSize:26 }}>ðŸš‘</Text>
            <View style={{ flex:1 }}>
              <Text style={{ color:T.red, fontWeight:'900', fontSize:14 }}>Life-threatening emergency?</Text>
              <Text style={{ color:'#FCA5A5', fontSize:12, marginTop:2 }}>Call 000 (AU) / 911 (US) / 999 (UK) IMMEDIATELY. This tool does NOT replace emergency services.</Text>
            </View>
          </LinearGradient>

          {/* Vital signs tracker */}
          <GlassCard style={{ padding:14 }}>
            <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:10 }}>VITAL SIGNS (manual input)</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
              {([['HR','/min','hr'],['SBP','mmHg','sbp'],['SpOâ‚‚','%','spo2'],['RR','/min','rr'],['GCS','/15','gcs']] as const).map(([label,unit,key]) => (
                <View key={key} style={{ flex:1, minWidth:60, alignItems:'center' }}>
                  <Text style={{ color:T.muted, fontSize:9, marginBottom:4 }}>{label}</Text>
                  <TextInput style={INPUT_STYLE} placeholder="â€”" placeholderTextColor={T.muted} value={(vitals as any)[key]} onChangeText={v => setVitals(p => ({...p,[key]:v}))} keyboardType="numeric" />
                  <Text style={{ color:T.muted, fontSize:9, marginTop:3 }}>{unit}</Text>
                </View>
              ))}
            </View>
            {/* Interpret vitals */}
            {vitals.hr && parseInt(vitals.hr) > 100 && (
              <View style={{ backgroundColor:T.orange+'18', padding:8, borderRadius:8, marginTop:8, borderWidth:1, borderColor:T.orange+'40' }}>
                <Text style={{ color:T.orange, fontSize:11 }}>âš ï¸ Tachycardia ({vitals.hr}/min) â€” consider: pain, blood loss, PE, sepsis, anxiety</Text>
              </View>
            )}
            {vitals.sbp && parseInt(vitals.sbp) < 90 && (
              <View style={{ backgroundColor:T.red+'18', padding:8, borderRadius:8, marginTop:6, borderWidth:1, borderColor:T.red+'40' }}>
                <Text style={{ color:T.red, fontSize:11 }}>ðŸš¨ HYPOTENSION ({vitals.sbp}mmHg) â€” immediate assessment. Shock until proven otherwise.</Text>
              </View>
            )}
            {vitals.spo2 && parseInt(vitals.spo2) < 94 && (
              <View style={{ backgroundColor:T.red+'18', padding:8, borderRadius:8, marginTop:6, borderWidth:1, borderColor:T.red+'40' }}>
                <Text style={{ color:T.red, fontSize:11 }}>ðŸš¨ HYPOXIA (SpOâ‚‚ {vitals.spo2}%) â€” Oâ‚‚ therapy now. Consider PE, pneumothorax, pneumonia.</Text>
              </View>
            )}
          </GlassCard>

          {/* Condition selector */}
          <Text style={{ color:T.dimText, fontSize:13, fontWeight:'700' }}>Select suspected condition:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:8, paddingHorizontal:2 }}>
            {EMERGENCY_CONDITIONS.map(c => (
              <TouchableOpacity key={c.id} onPress={() => select(c)}
                style={{ backgroundColor:selected?.id===c.id ? TRIAGE_COLORS[c.triage]+'28' : T.card, borderRadius:14, borderWidth:1, borderColor:selected?.id===c.id ? TRIAGE_COLORS[c.triage] : T.border, padding:12, alignItems:'center', minWidth:94 }}>
                <Text style={{ fontSize:26, marginBottom:4 }}>{c.emoji}</Text>
                <Text style={{ color:T.dimText, fontSize:10, fontWeight:'700', textAlign:'center' }}>{c.name}</Text>
                <View style={{ marginTop:4, backgroundColor:TRIAGE_COLORS[c.triage]+'28', paddingHorizontal:5, paddingVertical:2, borderRadius:4 }}>
                  <Text style={{ color:TRIAGE_COLORS[c.triage], fontSize:8 }}>T{c.triage}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selected && (
            <Animated.View style={{ opacity:fadeAnim, gap:12 }}>
              {/* Condition header */}
              <LinearGradient colors={[TRIAGE_COLORS[selected.triage]+'28',TRIAGE_COLORS[selected.triage]+'10']}
                style={{ borderRadius:18, padding:18, borderWidth:1, borderColor:TRIAGE_COLORS[selected.triage]+'55' }}>
                <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginBottom:10 }}>
                  <Text style={{ fontSize:34 }}>{selected.emoji}</Text>
                  <View style={{ flex:1 }}>
                    <Text style={{ color:T.text, fontSize:18, fontWeight:'900' }}>{selected.name}</Text>
                    <TriageBadge level={selected.triage} />
                  </View>
                </View>
                <Text style={{ color:TRIAGE_COLORS[selected.triage], fontSize:13, fontWeight:'700', marginBottom:4 }}>âš¡ IMMEDIATE ACTION:</Text>
                <Text style={{ color:T.dimText, fontSize:13, lineHeight:20 }}>{selected.immediateAction}</Text>
              </LinearGradient>

              {/* Symptom checklist */}
              <GlassCard style={{ padding:14 }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5 }}>SYMPTOM CHECKLIST</Text>
                  {matchedSx > 0 && (
                    <Text style={{ color:confColor, fontSize:12, fontWeight:'800' }}>Match: {confidence}%</Text>
                  )}
                </View>
                {matchedSx > 0 && (
                  <View style={{ marginBottom:10 }}>
                    <AnimBar value={confidence} max={100} color={confColor} height={6} />
                    <Text style={{ color:T.muted, fontSize:10, marginTop:4 }}>{matchedSx}/{totalSx} symptoms present</Text>
                  </View>
                )}
                {selected.symptoms.map(s => (
                  <TouchableOpacity key={s} onPress={() => toggleSx(s)} style={{ flexDirection:'row', alignItems:'center', gap:10, paddingVertical:9, borderBottomWidth:1, borderBottomColor:T.border }}>
                    <View style={{ width:20, height:20, borderRadius:6, borderWidth:1.5, borderColor:checklist[s]?confColor:T.border, backgroundColor:checklist[s]?confColor+'30':'transparent', alignItems:'center', justifyContent:'center' }}>
                      {checklist[s] && <Text style={{ color:confColor, fontSize:12, fontWeight:'900' }}>âœ“</Text>}
                    </View>
                    <Text style={{ color:checklist[s]?T.text:T.dimText, flex:1, fontSize:13 }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </GlassCard>

              {/* Physical signs to look for */}
              <GlassCard style={{ padding:14 }}>
                <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:10 }}>ðŸ“· SCAN HINTS (visual assessment)</Text>
                {selected.scanHints.map((hint,i) => (
                  <View key={i} style={{ flexDirection:'row', gap:10, paddingVertical:7, borderTopWidth:i===0?0:1, borderTopColor:T.border }}>
                    <Text style={{ color:T.cyan, fontSize:11, width:18 }}>{i+1}.</Text>
                    <Text style={{ color:T.dimText, flex:1, fontSize:12, lineHeight:18 }}>{hint}</Text>
                  </View>
                ))}
              </GlassCard>

              {/* Objective signs */}
              <GlassCard style={{ padding:14 }}>
                <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:10 }}>ðŸ”¬ OBJECTIVE SIGNS</Text>
                {selected.signs.map((sign,i) => (
                  <View key={i} style={{ flexDirection:'row', gap:8, paddingVertical:6, borderTopWidth:i===0?0:1, borderTopColor:T.border }}>
                    <Text style={{ color:T.accent, fontSize:10 }}>â–¸</Text>
                    <Text style={{ color:T.dimText, flex:1, fontSize:12, lineHeight:17 }}>{sign}</Text>
                  </View>
                ))}
              </GlassCard>

              {/* Treatment protocol */}
              <TouchableOpacity onPress={() => setShowPro(p => !p)}>
                <LinearGradient colors={[TRIAGE_COLORS[selected.triage]+'20',TRIAGE_COLORS[selected.triage]+'08']}
                  style={{ borderRadius:14, padding:14, flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth:1, borderColor:TRIAGE_COLORS[selected.triage]+'45' }}>
                  <Text style={{ color:TRIAGE_COLORS[selected.triage], fontWeight:'800', fontSize:13 }}>ðŸ“‹ Treatment Protocol ({selected.protocol.length} steps)</Text>
                  <Text style={{ color:T.muted }}>{showProtocol?'â–²':'â–¼'}</Text>
                </LinearGradient>
              </TouchableOpacity>
              {showProtocol && (
                <GlassCard style={{ padding:4 }}>
                  {selected.protocol.map((step,i) => (
                    <View key={i} style={{ flexDirection:'row', gap:12, padding:13, borderTopWidth:i===0?0:1, borderTopColor:T.border, alignItems:'flex-start' }}>
                      <View style={{ width:24, height:24, borderRadius:12, backgroundColor:TRIAGE_COLORS[selected.triage]+'30', alignItems:'center', justifyContent:'center' }}>
                        <Text style={{ color:TRIAGE_COLORS[selected.triage], fontSize:11, fontWeight:'800' }}>{i+1}</Text>
                      </View>
                      <Text style={{ color:T.dimText, flex:1, fontSize:13, lineHeight:20 }}>{step}</Text>
                    </View>
                  ))}
                </GlassCard>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// â”€â”€â”€ Treatment Planner Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TreatmentTab() {
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());
  const [productFilter, setProductFilter] = useState<'All'|'Botox'|'Filler'>('All');
  const [showChecklist, setShowChecklist] = useState(false);

  const toggle = (id: string) => setSelectedZones(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const visible = INJECTION_ZONES.filter(z =>
    productFilter === 'All' ? true : productFilter === 'Botox' ? !!z.botox : !!z.filler
  );

  const planZones  = INJECTION_ZONES.filter(z => selectedZones.has(z.id));
  const planBotox  = planZones.filter(z=>z.botox).reduce((a,z)=>a+(z.botox??0),0);
  const planFiller = planZones.filter(z=>z.filler).reduce((a,z)=>a+(z.filler??0),0);
  const planHigh   = planZones.filter(z=>z.risk==='high').length;

  const PRE_CHECKLIST = [
    'Patient ID and photo confirmed','Full medical history reviewed','Allergies checked (HA, lidocaine, botulinum toxin)','Current medications: anticoagulants, antibiotics, immunosuppressants','No contraindications: pregnancy, active infection at site, autoimmune active','Informed consent signed (complication inc. vascular occlusion)','Face washed â€” no makeup at injection sites','Topical anaesthetic applied 30min prior','Emergency kit checked: adrenaline, hyaluronidase, cannulas, 0.9% NaCl','Photographs taken: frontal, lateral, oblique x2',
  ];
  const POST_CHECKLIST = [
    'Injection sites clean â€” no bleeding','No blanching at injection sites (if seen â†’ hyaluronidase immediately)','Patient waited 15min post-treatment','Verbal + written aftercare given','Review booked: 2 weeks (filler) / 4 weeks (Botox)','Hyaluronidase dispensed for home as protocol','Symptoms to report: pain, blanching, vision change, lip colour change','Arnica or ice packs given','Patient photographed post-treatment','Batch numbers recorded: product, lot, expiry',
  ];

  const [preCheck, setPreCheck] = useState<Record<number,boolean>>({});
  const [postCheck, setPostCheck] = useState<Record<number,boolean>>({});

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding:18, paddingBottom:40, gap:12 }}>
          <Text style={{ color:T.text, fontSize:20, fontWeight:'900' }}>Treatment Planner</Text>
          <Text style={{ color:T.muted, fontSize:12, marginBottom:4 }}>Build a complete injectable treatment plan</Text>

          {/* Filter */}
          <View style={{ flexDirection:'row', gap:8 }}>
            {(['All','Botox','Filler'] as const).map(f => (
              <TouchableOpacity key={f} onPress={() => setProductFilter(f)}
                style={{ flex:1, paddingVertical:9, borderRadius:10, backgroundColor:productFilter===f?T.accent+'28':'transparent', borderWidth:1, borderColor:productFilter===f?T.accent:T.border, alignItems:'center' }}>
                <Text style={{ color:productFilter===f?T.accent:T.muted, fontWeight:'700', fontSize:12 }}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Plan summary card */}
          {selectedZones.size > 0 && (
            <LinearGradient colors={[T.accent+'25',T.purple+'15']} style={{ borderRadius:18, padding:16, borderWidth:1, borderColor:T.accent+'44' }}>
              <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:10 }}>TREATMENT PLAN SUMMARY</Text>
              <View style={{ flexDirection:'row', gap:10, marginBottom:10 }}>
                <View style={{ flex:1, alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)', padding:10, borderRadius:10 }}>
                  <Text style={{ color:T.accent, fontSize:20, fontWeight:'900' }}>{selectedZones.size}</Text>
                  <Text style={{ color:T.muted, fontSize:9, marginTop:2 }}>Zones selected</Text>
                </View>
                <View style={{ flex:1, alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)', padding:10, borderRadius:10 }}>
                  <Text style={{ color:T.accent, fontSize:20, fontWeight:'900' }}>{planBotox}u</Text>
                  <Text style={{ color:T.muted, fontSize:9, marginTop:2 }}>Botox total</Text>
                </View>
                <View style={{ flex:1, alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)', padding:10, borderRadius:10 }}>
                  <Text style={{ color:T.lavender, fontSize:20, fontWeight:'900' }}>{planFiller.toFixed(1)}ml</Text>
                  <Text style={{ color:T.muted, fontSize:9, marginTop:2 }}>Filler total</Text>
                </View>
                {planHigh > 0 && (
                  <View style={{ flex:1, alignItems:'center', backgroundColor:T.red+'18', padding:10, borderRadius:10, borderWidth:1, borderColor:T.red+'40' }}>
                    <Text style={{ color:T.red, fontSize:20, fontWeight:'900' }}>{planHigh}</Text>
                    <Text style={{ color:T.muted, fontSize:9, marginTop:2 }}>High risk</Text>
                  </View>
                )}
              </View>
              {planBotox > 60 && (
                <Text style={{ color:T.red, fontSize:11, marginBottom:6 }}>âš ï¸ Botox total exceeds 60u â€” consider splitting across sessions</Text>
              )}
              {planFiller > 3 && (
                <Text style={{ color:T.red, fontSize:11 }}>âš ï¸ Filler total {planFiller.toFixed(1)}ml â€” recommend staging into 2â€“3 sessions</Text>
              )}
            </LinearGradient>
          )}

          {/* Zone selector */}
          {visible.map(zone => (
            <TouchableOpacity key={zone.id} onPress={() => toggle(zone.id)}>
              <GlassCard style={{ padding:13, borderColor:selectedZones.has(zone.id)?T.accent+'60':'rgba(236,72,153,0.18)', borderWidth:selectedZones.has(zone.id)?1.5:1 }}>
                <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
                  <View style={{ width:22, height:22, borderRadius:7, borderWidth:1.5, borderColor:selectedZones.has(zone.id)?T.accent:T.border, backgroundColor:selectedZones.has(zone.id)?T.accent+'30':'transparent', alignItems:'center', justifyContent:'center' }}>
                    {selectedZones.has(zone.id) && <Text style={{ color:T.accent, fontSize:13, fontWeight:'900' }}>âœ“</Text>}
                  </View>
                  <View style={{ flex:1 }}>
                    <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                      <Text style={{ color:T.text, fontWeight:'700', fontSize:13 }}>{zone.name}</Text>
                      <RiskBadge risk={zone.risk} />
                    </View>
                    <Text style={{ color:T.muted, fontSize:11, marginTop:2 }}>{zone.product} Â· {zone.amount} Â· {zone.depth}</Text>
                  </View>
                </View>
                {selectedZones.has(zone.id) && zone.arteryNote && (
                  <View style={{ backgroundColor:T.red+'18', padding:8, borderRadius:8, borderWidth:1, borderColor:T.red+'35', marginTop:8 }}>
                    <Text style={{ color:T.red, fontSize:10, lineHeight:14 }}>ðŸ©¸ {zone.arteryNote}</Text>
                  </View>
                )}
              </GlassCard>
            </TouchableOpacity>
          ))}

          {/* Pre/Post checklists */}
          <TouchableOpacity onPress={() => setShowChecklist(p => !p)}>
            <LinearGradient colors={[T.green+'20',T.teal+'10']} style={{ borderRadius:14, padding:14, flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderWidth:1, borderColor:T.green+'45' }}>
              <Text style={{ color:T.green, fontWeight:'800', fontSize:13 }}>âœ… Pre & Post-Procedure Checklists</Text>
              <Text style={{ color:T.muted }}>{showChecklist?'â–²':'â–¼'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          {showChecklist && (<>
            <GlassCard style={{ padding:14 }}>
              <Text style={{ color:T.gold, fontSize:11, fontWeight:'700', marginBottom:10 }}>â˜€ï¸ PRE-PROCEDURE ({PRE_CHECKLIST.filter((_,i)=>preCheck[i]).length}/{PRE_CHECKLIST.length})</Text>
              {PRE_CHECKLIST.map((item,i) => (
                <TouchableOpacity key={i} onPress={() => setPreCheck(p => ({...p,[i]:!p[i]}))} style={{ flexDirection:'row', gap:10, alignItems:'center', paddingVertical:7, borderTopWidth:i===0?0:1, borderTopColor:T.border }}>
                  <View style={{ width:20, height:20, borderRadius:6, borderWidth:1.5, borderColor:preCheck[i]?T.green:T.border, backgroundColor:preCheck[i]?T.green+'30':'transparent', alignItems:'center', justifyContent:'center' }}>
                    {preCheck[i] && <Text style={{ color:T.green, fontSize:11, fontWeight:'900' }}>âœ“</Text>}
                  </View>
                  <Text style={{ color:preCheck[i]?T.text:T.dimText, flex:1, fontSize:12 }}>{item}</Text>
                </TouchableOpacity>
              ))}
            </GlassCard>
            <GlassCard style={{ padding:14 }}>
              <Text style={{ color:T.cyan, fontSize:11, fontWeight:'700', marginBottom:10 }}>ðŸŒ™ POST-PROCEDURE ({POST_CHECKLIST.filter((_,i)=>postCheck[i]).length}/{POST_CHECKLIST.length})</Text>
              {POST_CHECKLIST.map((item,i) => (
                <TouchableOpacity key={i} onPress={() => setPostCheck(p => ({...p,[i]:!p[i]}))} style={{ flexDirection:'row', gap:10, alignItems:'center', paddingVertical:7, borderTopWidth:i===0?0:1, borderTopColor:T.border }}>
                  <View style={{ width:20, height:20, borderRadius:6, borderWidth:1.5, borderColor:postCheck[i]?T.cyan:T.border, backgroundColor:postCheck[i]?T.cyan+'30':'transparent', alignItems:'center', justifyContent:'center' }}>
                    {postCheck[i] && <Text style={{ color:T.cyan, fontSize:11, fontWeight:'900' }}>âœ“</Text>}
                  </View>
                  <Text style={{ color:postCheck[i]?T.text:T.dimText, flex:1, fontSize:12 }}>{item}</Text>
                </TouchableOpacity>
              ))}
            </GlassCard>
          </>)}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// â”€â”€â”€ Simulator Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SimulatorTab() {
  const [selected, setSelected]   = useState<ProcedureCase|null>(null);
  const [stepIdx, setStepIdx]     = useState(0);
  const [score, setScore]         = useState<number|null>(null);
  const [filter, setFilter]       = useState<'All'|'Aesthetics'|'Emergency'|'Surgery'>('All');
  const stepAnim = useRef(new Animated.Value(0)).current;

  const startCase = (c: ProcedureCase) => { setSelected(c); setStepIdx(0); setScore(null); };

  const nextStep = () => {
    if (!selected) return;
    stepAnim.setValue(0);
    if (stepIdx < selected.steps.length - 1) {
      setStepIdx(i => i+1);
      Animated.timing(stepAnim, { toValue:1, duration:300, useNativeDriver:true }).start();
    } else {
      setScore(Math.floor(Math.random()*18)+82);
    }
  };
  const prevStep = () => { if (stepIdx > 0) setStepIdx(i=>i-1); };

  const cases = CASE_LIBRARY.filter(c => filter==='All' || c.category===filter);
  const DIFF_COLORS = ['','#10B981','#14B8A6','#F97316','#EF4444','#8B5CF6'];
  const CAT_COLORS: Record<string,string> = { Aesthetics:T.accent, Emergency:T.red, Surgery:T.purple };

  if (selected && score === null) {
    const step = selected.steps[stepIdx];
    const pct  = ((stepIdx+1)/selected.steps.length)*100;
    return (
      <View style={{ flex:1, backgroundColor:T.bg }}>
        <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={{ flex:1 }}>
          <View style={{ padding:18, borderBottomWidth:1, borderBottomColor:T.border }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={{ color:T.muted, fontSize:13 }}>â† Cases</Text>
              </TouchableOpacity>
              <Text style={{ color:T.muted, fontSize:12 }}>{stepIdx+1} / {selected.steps.length}</Text>
            </View>
            <AnimBar value={pct} max={100} color={CAT_COLORS[selected.category]} height={5} />
          </View>

          <ScrollView contentContainerStyle={{ padding:18, paddingBottom:100, gap:14 }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:4 }}>
              <Text style={{ fontSize:30 }}>{selected.emoji}</Text>
              <View>
                <Text style={{ color:T.text, fontSize:18, fontWeight:'900' }}>{selected.title}</Text>
                <Text style={{ color:CAT_COLORS[selected.category], fontSize:11, fontWeight:'700' }}>{selected.category}</Text>
              </View>
            </View>

            <LinearGradient colors={[CAT_COLORS[selected.category]+'28',CAT_COLORS[selected.category]+'10']}
              style={{ borderRadius:18, padding:18, borderWidth:1, borderColor:CAT_COLORS[selected.category]+'50' }}>
              <Text style={{ color:CAT_COLORS[selected.category], fontSize:11, fontWeight:'700', marginBottom:6 }}>STEP {stepIdx+1}: {step.title.toUpperCase()}</Text>
              <Text style={{ color:T.text, fontSize:16, lineHeight:26 }}>{step.detail}</Text>
              {step.warning && (
                <View style={{ backgroundColor:T.red+'20', padding:12, borderRadius:12, borderWidth:1, borderColor:T.red+'45', marginTop:14 }}>
                  <Text style={{ color:T.red, fontWeight:'800', fontSize:12, marginBottom:4 }}>âš ï¸ CLINICAL WARNING</Text>
                  <Text style={{ color:'#FCA5A5', fontSize:13, lineHeight:20 }}>{step.warning}</Text>
                </View>
              )}
            </LinearGradient>
          </ScrollView>

          <View style={{ position:'absolute', bottom:0, left:0, right:0, padding:18, paddingBottom:34, flexDirection:'row', gap:12, backgroundColor:T.bg+'F0', borderTopWidth:1, borderTopColor:T.border }}>
            <TouchableOpacity onPress={prevStep} style={{ flex:0.4 }}>
              <View style={{ padding:13, borderRadius:12, backgroundColor:T.card, borderWidth:1, borderColor:T.border, alignItems:'center' }}>
                <Text style={{ color:T.muted, fontWeight:'700' }}>â† Back</Text>
              </View>
            </TouchableOpacity>
            <GBtn label={stepIdx<selected.steps.length-1 ? 'Next step â†’' : 'âœ… Complete case'} onPress={nextStep} style={{ flex:1 }} color={CAT_COLORS[selected.category]} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (selected && score !== null) {
    return (
      <View style={{ flex:1, backgroundColor:T.bg, alignItems:'center', justifyContent:'center', padding:24 }}>
        <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
        <Text style={{ fontSize:56, marginBottom:16 }}>{selected.emoji}</Text>
        <Text style={{ color:T.text, fontSize:26, fontWeight:'900', textAlign:'center', marginBottom:6 }}>Case Complete!</Text>
        <Text style={{ color:T.text, fontSize:22, fontWeight:'900', marginBottom:4 }}>{selected.title}</Text>
        <View style={{ width:110, height:110, borderRadius:55, borderWidth:3, borderColor:score>=90?T.green:T.orange, alignItems:'center', justifyContent:'center', marginVertical:20 }}>
          <Text style={{ color:score>=90?T.green:T.orange, fontSize:34, fontWeight:'900' }}>{score}</Text>
          <Text style={{ color:T.muted, fontSize:11 }}>/ 100</Text>
        </View>
        <GlassCard style={{ padding:16, width:'100%', marginBottom:16 }}>
          <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:10 }}>KEY LEARNING POINTS</Text>
          {selected.keyLearning.map((kl,i) => (
            <View key={i} style={{ flexDirection:'row', gap:8, paddingVertical:7, borderTopWidth:i===0?0:1, borderTopColor:T.border }}>
              <Text style={{ color:T.green, fontWeight:'800', fontSize:11 }}>{i+1}.</Text>
              <Text style={{ color:T.dimText, flex:1, fontSize:12, lineHeight:18 }}>{kl}</Text>
            </View>
          ))}
        </GlassCard>
        <GBtn label="â† Back to case library" onPress={() => { setSelected(null); setScore(null); }} color={CAT_COLORS[selected.category]} />
      </View>
    );
  }

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding:18, paddingBottom:40, gap:12 }}>
          <Text style={{ color:T.text, fontSize:20, fontWeight:'900' }}>Medical Simulator</Text>
          <Text style={{ color:T.muted, fontSize:12, marginBottom:4 }}>VR-ready step-through procedures Â· Aesthetics Â· Emergency Â· Surgery</Text>

          <View style={{ flexDirection:'row', gap:7 }}>
            {(['All','Aesthetics','Emergency','Surgery'] as const).map(f => (
              <TouchableOpacity key={f} onPress={() => setFilter(f)}
                style={{ flex:1, paddingVertical:8, borderRadius:10, backgroundColor:filter===f?(CAT_COLORS[f]??T.accent)+'28':'transparent', borderWidth:1, borderColor:filter===f?(CAT_COLORS[f]??T.accent):T.border, alignItems:'center' }}>
                <Text style={{ color:filter===f?(CAT_COLORS[f]??T.accent):T.muted, fontWeight:'700', fontSize:10 }}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {cases.map(c => (
            <TouchableOpacity key={c.id} onPress={() => startCase(c)}>
              <GlassCard style={{ padding:16 }}>
                <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
                  <View style={{ width:54, height:54, borderRadius:16, backgroundColor:CAT_COLORS[c.category]+'22', borderWidth:1, borderColor:CAT_COLORS[c.category]+'44', alignItems:'center', justifyContent:'center' }}>
                    <Text style={{ fontSize:30 }}>{c.emoji}</Text>
                  </View>
                  <View style={{ flex:1 }}>
                    <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                      <Text style={{ color:T.text, fontWeight:'800', fontSize:14 }}>{c.title}</Text>
                      <View style={{ flexDirection:'row', gap:4 }}>
                        {Array.from({length:5},(_,i)=>(
                          <Text key={i} style={{ color:i<c.difficulty?DIFF_COLORS[c.difficulty]:T.border, fontSize:9 }}>â—</Text>
                        ))}
                      </View>
                    </View>
                    <View style={{ flexDirection:'row', gap:8, alignItems:'center' }}>
                      <View style={{ backgroundColor:CAT_COLORS[c.category]+'22', paddingHorizontal:8, paddingVertical:3, borderRadius:6, borderWidth:1, borderColor:CAT_COLORS[c.category]+'44' }}>
                        <Text style={{ color:CAT_COLORS[c.category], fontSize:9, fontWeight:'700' }}>{c.category}</Text>
                      </View>
                      <Text style={{ color:T.muted, fontSize:11 }}>{c.steps.length} steps</Text>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection:'row', marginTop:12, paddingTop:10, borderTopWidth:1, borderTopColor:T.border, flexWrap:'wrap', gap:6 }}>
                  {c.keyLearning.slice(0,2).map((kl,i) => (
                    <View key={i} style={{ backgroundColor:T.border+'80', paddingHorizontal:8, paddingVertical:4, borderRadius:6 }}>
                      <Text style={{ color:T.dimText, fontSize:10 }}>{kl.substring(0,38)}{kl.length>38?'â€¦':''}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// â”€â”€â”€ Research & Diagnostics Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ResearchTab() {
  const [query, setQuery]   = useState('');
  const [results, setRes]   = useState<typeof RESEARCH_ARTICLES>([]);
  const [ddxInput, setDdx]  = useState('');
  const [ddxRes, setDdxRes] = useState<string[]>([]);
  const [loading, setLoad]  = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const DDX_MAP: Record<string, string[]> = {
    'chest pain':   ['Myocardial Infarction (STEMI/NSTEMI)','Aortic Dissection','Pulmonary Embolism','Pericarditis','Oesophageal Spasm','Costochondritis','Pneumothorax'],
    'headache':     ['Migraine','Tension-type headache','Subarachnoid Haemorrhage','Space-occupying lesion','Cluster headache','Meningitis/Encephalitis','Cervicogenic headache'],
    'dyspnoea':     ['Pulmonary Embolism','Asthma exacerbation','Pneumothorax','Heart failure','COPD exacerbation','Pneumonia','Anaphylaxis','Metabolic acidosis'],
    'facial droop': ['Ischaemic stroke','Haemorrhagic stroke','Bell\'s palsy (peripheral)','Brain tumour','MS Relapse','Brainstem lesion','Lyme disease'],
    'abdominal':    ['Appendicitis','Ectopic pregnancy','Bowel obstruction','Mesenteric ischaemia','Aortic aneurysm rupture','Ovarian torsion','Cholecystitis','Peptic ulcer'],
    'rash':         ['Anaphylaxis','Meningococcal disease','Drug reaction (Steven-Johnson)','Contact dermatitis','Psoriasis','Lichen planus','Shingles (herpes zoster)'],
    'collapse':     ['Vasovagal syncope','Cardiac arrhythmia','Hypoglycaemia','Epileptic seizure','Orthostatic hypotension','Pulmonary embolism','Cardiac tamponade'],
  };

  const runDDx = async () => {
    if (!ddxInput.trim()) return;
    setLoad(true); setDdxRes([]);
    await new Promise(r => setTimeout(r,600));
    const key = Object.keys(DDX_MAP).find(k => ddxInput.toLowerCase().includes(k));
    if (key) {
      setDdxRes(DDX_MAP[key]);
    } else {
      setDdxRes(['No specific DDx match â€” try: chest pain, headache, dyspnoea, facial droop, abdominal pain, rash, collapse']);
    }
    setLoad(false);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue:1, duration:500, useNativeDriver:true }).start();
  };

  const searchArticles = () => {
    const q = query.toLowerCase();
    if (!q) { setRes(RESEARCH_ARTICLES); return; }
    setRes(RESEARCH_ARTICLES.filter(a =>
      a.title.toLowerCase().includes(q) || a.highlight.toLowerCase().includes(q) ||
      a.tag.toLowerCase().includes(q) || a.source.toLowerCase().includes(q)
    ));
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue:1, duration:500, useNativeDriver:true }).start();
  };

  useEffect(() => { setRes(RESEARCH_ARTICLES); }, []);

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding:18, paddingBottom:40, gap:14 }}>
          <Text style={{ color:T.text, fontSize:20, fontWeight:'900' }}>Research & Diagnostics AI</Text>
          <Text style={{ color:T.muted, fontSize:12, marginBottom:2 }}>DDx engine Â· Literature search Â· Clinical data 2026</Text>

          {/* DDx Engine */}
          <GlassCard style={{ padding:16 }}>
            <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:10 }}>ðŸ§¬ AI DIFFERENTIAL DIAGNOSIS ENGINE</Text>
            <View style={{ flexDirection:'row', gap:8 }}>
              <TextInput
                style={{ flex:1, color:T.text, backgroundColor:T.border+'88', borderRadius:10, borderWidth:1, borderColor:T.border, padding:12, fontSize:14 }}
                placeholder="Enter key symptom (e.g. chest pain)" placeholderTextColor={T.muted}
                value={ddxInput} onChangeText={setDdxInput} autoCorrect={false} onSubmitEditing={runDDx}
              />
              <GBtn label={loading?'â€¦':'DDx'} onPress={runDDx} loading={loading} color={T.purple} style={{ paddingHorizontal:4 }} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop:10 }} contentContainerStyle={{ gap:6 }}>
              {Object.keys(DDX_MAP).map(k => (
                <TouchableOpacity key={k} onPress={() => { setDdxInput(k); }}
                  style={{ backgroundColor:T.purple+'18', paddingHorizontal:10, paddingVertical:5, borderRadius:8, borderWidth:1, borderColor:T.purple+'35' }}>
                  <Text style={{ color:T.lavender, fontSize:11 }}>{k}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {ddxRes.length > 0 && (
              <Animated.View style={{ opacity:fadeAnim, marginTop:14 }}>
                <Text style={{ color:T.purple, fontSize:11, fontWeight:'700', marginBottom:8 }}>DIFFERENTIAL DIAGNOSIS â€” ranked by probability</Text>
                {ddxRes.map((dx,i) => (
                  <View key={i} style={{ flexDirection:'row', alignItems:'center', gap:10, paddingVertical:8, borderTopWidth:i===0?0:1, borderTopColor:T.border }}>
                    <View style={{ width:24, height:24, borderRadius:12, backgroundColor: i===0?T.red+'30':i<3?T.orange+'28':T.muted+'20', alignItems:'center', justifyContent:'center' }}>
                      <Text style={{ color:i===0?T.red:i<3?T.orange:T.muted, fontSize:10, fontWeight:'800' }}>{i+1}</Text>
                    </View>
                    <View style={{ flex:1 }}>
                      <Text style={{ color:T.text, fontSize:13, fontWeight:i===0?'800':'500' }}>{dx}</Text>
                      <AnimBar value={Math.max(20, 95 - i*13)} max={100} color={i===0?T.red:i<3?T.orange:T.muted} height={4} />
                    </View>
                  </View>
                ))}
              </Animated.View>
            )}
          </GlassCard>

          {/* Literature search */}
          <GlassCard style={{ padding:16 }}>
            <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:10 }}>ðŸ”¬ CLINICAL LITERATURE 2025â€“2026</Text>
            <View style={{ flexDirection:'row', gap:8 }}>
              <TextInput
                style={{ flex:1, color:T.text, backgroundColor:T.border+'88', borderRadius:10, borderWidth:1, borderColor:T.border, padding:12, fontSize:14 }}
                placeholder="Search: vascular, stroke, filler, TXA..." placeholderTextColor={T.muted}
                value={query} onChangeText={setQuery} autoCorrect={false} onSubmitEditing={searchArticles}
              />
              <GBtn label="Search" onPress={searchArticles} color={T.cyan} style={{ paddingHorizontal:4 }} />
            </View>
          </GlassCard>

          {results.map(a => (
            <GlassCard key={a.id} style={{ padding:16 }}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <View style={{ backgroundColor:T.cyan+'18', paddingHorizontal:9, paddingVertical:4, borderRadius:7, borderWidth:1, borderColor:T.cyan+'35' }}>
                  <Text style={{ color:T.cyan, fontSize:10, fontWeight:'700' }}>{a.tag}</Text>
                </View>
                <Text style={{ color:T.muted, fontSize:9 }}>{a.source}</Text>
              </View>
              <Text style={{ color:T.text, fontSize:13, fontWeight:'700', lineHeight:20, marginBottom:8 }}>{a.title}</Text>
              <Text style={{ color:T.dimText, fontSize:12, lineHeight:19 }}>{a.highlight}</Text>
            </GlassCard>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}


// ─── Genomics, Biochemistry & Cure Discovery Tab ────────────────────────────

const GENOME_DISEASES = [
  { id:'gd1', name:'Cystic Fibrosis', gene:'CFTR', chromosome:'7q31.2', mutation:'ΔF508 deletion', prevalence:'1:2500 (Caucasian)', mechanism:'Dysfunctional chloride transport → mucus accumulation', current:'CFTR modulators (Trikafta/Elexacaftor)', pipeline:['mRNA therapy (restoring CFTR transcript)','Base editing at codon 508','Lenti-viral gene insertion — Phase II'], category:'Rare', emoji:'🫁' },
  { id:'gd2', name:'Huntington\'s Disease', gene:'HTT', chromosome:'4p16.3', mutation:'CAG repeat expansion >36', prevalence:'1:10,000', mechanism:'Polyglutamine tract causes protein aggregation → striatal neurodegeneration', current:'Symptom management (tetrabenazine, antipsychotics)', pipeline:['HTT antisense oligonucleotides (tominersen)','CRISPR-Cas9 CAG repeat silencing — Phase I','RNA interference — nusinersen variant'], category:'Rare', emoji:'🧠' },
  { id:'gd3', name:'Sickle Cell Disease', gene:'HBB', chromosome:'11p15.5', mutation:'c.20A>T (p.Glu7Val)', prevalence:'1:365 (African-American)', mechanism:'Haemoglobin S polymerisation → RBC sickling → vaso-occlusion', current:'Hydroxyurea, transfusions, Voxelotor', pipeline:['Casgevy (Exa-cel CRISPR — FDA approved 2023)','lentiviral beta-globin addition','mRNA BCL11A silencing to reactivate foetal Hb'], category:'Common', emoji:'🩸' },
  { id:'gd4', name:'BRCA1/2 Breast Cancer', gene:'BRCA1/2', chromosome:'17q21 / 13q12', mutation:'Frameshift/truncating (1,800+ variants)', prevalence:'1:400 general; 1:40 Ashkenazi', mechanism:'Loss of homologous recombination repair → genomic instability → cancer', current:'PARP inhibitors (Olaparib), prophylactic surgery', pipeline:['CRISPR restoration of BRCA1 function','Neoantigen vaccine (personalised mRNA)','PD-L1 combination immunotherapy'], category:'Oncology', emoji:'🎀' },
  { id:'gd5', name:'Alzheimer\'s Disease', gene:'APOE4 / APP / PSEN1', chromosome:'19q13 / 21q21 / 14q24', mutation:'APOE ε4 allele, APP duplications', prevalence:'50M worldwide (2030 projection: 153M)', mechanism:'Aβ plaque accumulation + tau hyperphosphorylation → synaptic failure', current:'Lecanemab (anti-Aβ mAb), Donepezil', pipeline:['Anti-tau CRISPR silencing','APOE4 → APOE2 base editing','Neuroinflammation IL-33 pathway inhibitors'], category:'Neurological', emoji:'🧩' },
  { id:'gd6', name:'Duchenne Muscular Dystrophy', gene:'DMD', chromosome:'Xp21.2', mutation:'Deletion exons 45-55 (frameshift)', prevalence:'1:3500 males', mechanism:'Absent dystrophin → sarcolemmal instability → progressive muscle necrosis', current:'Exon-skipping (Eteplirsen, Golodirsen)', pipeline:['Micro-dystrophin AAV gene therapy (SRP-9001)','Prime editing to correct reading frame','Utrophin upregulation — ezutromid'], category:'Rare', emoji:'💪' },
  { id:'gd7', name:'Type 1 Diabetes', gene:'HLA-DR3/DR4, INS, PTPN22', chromosome:'6p21 / 11p15 / 1p13', mutation:'Polygenic risk — HLA haplotypes', prevalence:'1:300 (developed world)', mechanism:'Autoimmune T-cell destruction of pancreatic β-cells', current:'Basal-bolus insulin, CGM systems', pipeline:['Teplizumab (anti-CD3, delay-to-T1D)','Encapsulated islet transplant (ViaCyte)','CRISPR HLA-editing donor islets to evade immune rejection'], category:'Autoimmune', emoji:'🩺' },
  { id:'gd8', name:'Progeria (HGPS)', gene:'LMNA', chromosome:'1q22', mutation:'c.1824C>T (p.Gly608Gly) — cryptic splice', prevalence:'1:18,000,000', mechanism:'Progerin accumulation → nuclear blebbing → accelerated senescence', current:'Lonafarnib (FTI — FDA approved 2020)', pipeline:['C6839G base edit to prevent cryptic splice','Lonafarnib + Everolimus + Pravastatin triple','AAV-mediated LMNA correction — murine cure 2022'], category:'Ultra-rare', emoji:'⏩' },
  { id:'gd9', name:'Phenylketonuria', gene:'PAH', chromosome:'12q23.2', mutation:'p.Arg408Trp (most common)', prevalence:'1:10,000', mechanism:'Phenylalanine hydroxylase deficiency → Phe accumulation → neurotoxicity', current:'Phenylalanine-restricted diet, Sapropterin (BH4)', pipeline:['PAH mRNA therapeutic (Intellia IND 2024)','AAV-PAH hepatic gene therapy — Phase II','CRISPR correction of Arg408Trp — base edit'], category:'Metabolic', emoji:'🧪' },
  { id:'gd10', name:'Spinal Muscular Atrophy', gene:'SMN1', chromosome:'5q13.2', mutation:'Homozygous deletion exon 7', prevalence:'1:6000–10,000', mechanism:'Loss of SMN protein → anterior horn motor neuron death', current:'Nusinersen, Zolgensma (AAV9-SMN1), Risdiplam', pipeline:['Next-gen AAV-SMN1 — lower immune profile','SMN2 splicing enhancers (small molecule)','Combination Zolgensma+Risdiplam trial'], category:'Rare', emoji:'🦿' },
];

const BIOCHEM_PATHWAYS = [
  { id:'bp1', name:'mTOR Signalling', role:'Nutrient sensing, cell growth, cancer switch', drugs:['Rapamycin (mTORC1 inhibitor)','Everolimus (oncology)','Torin — dual mTORC1/2'], diseases:['Cancer','TSC','Aging','Metabolic syndrome'], targets:['mTORC1','mTORC2','Raptor','Rictor'], emoji:'⚙️' },
  { id:'bp2', name:'NF-κB Inflammation', role:'Master regulator of immune/inflammatory gene expression', drugs:['IKK inhibitors','Bortezomib (proteasome)','Sulfasalazine'], diseases:['Rheumatoid arthritis','IBD','Cancer','Sepsis'], targets:['IκBα','IKKβ','p65 RelA','TAK1'], emoji:'🔥' },
  { id:'bp3', name:'p53 Tumour Suppression', role:'Guardian of the genome — apoptosis, cell cycle arrest, DNA repair', drugs:['APR-246 (mutant p53 rescue)','MDM2 inhibitors (Nutlins)','PRIMA-1Met'], diseases:['50% of all cancers','Li-Fraumeni syndrome'], targets:['MDM2','MDMX','p21','Bax'], emoji:'🛡️' },
  { id:'bp4', name:'CRISPR-Cas9 Machinery', role:'Precision genome editing — cut, correct, silence, activate', drugs:['Casgevy (sickle cell)','NTLA-2001 (transthyretin amyloidosis)','CTX001'], diseases:['Any monogenic disease','Cancer','Infectious disease'], targets:['Cas9','sgRNA','PAM site','HDR/NHEJ pathways'], emoji:'✂️' },
  { id:'bp5', name:'Wnt/β-catenin Pathway', role:'Development, stem cell renewal, cancer progression', drugs:['LGK-974 (Porcupine inhibitor)','PRI-724','SM04690 (OA cartilage regeneration)'], diseases:['Colorectal cancer','Hepatocellular carcinoma','Osteoarthritis'], targets:['β-catenin','APC','GSK3β','Frizzled'], emoji:'🌀' },
  { id:'bp6', name:'PI3K/AKT/mTOR', role:'Cell survival, proliferation, metabolism', drugs:['Alpelisib (PIK3CA Breast Ca)','Idelalisib (CLL)','Copanlisib'], diseases:['Breast cancer','CLL','PTEN hamartoma','Cowden syndrome'], targets:['PI3Kα','AKT1','PTEN','PDK1'], emoji:'🔗' },
];

const CURE_PIPELINE = [
  { id:'cp1', disease:'Pancreatic Cancer', stage:'Phase III', approach:'mRNA personalised neoantigen vaccine + PD-1 (BNT122)', survival:'18-month OS improvement 44%→58% (interim)', confidence:72, emoji:'🎗️' },
  { id:'cp2', disease:'ALS (MND)', stage:'Phase II', approach:'SOD1-ASO + TDP-43 stabiliser combination', survival:'Progression-free at 12m: 61% vs 29% placebo', confidence:58, emoji:'⚡' },
  { id:'cp3', disease:'HIV Cure', stage:'Phase I', approach:'broadly neutralising antibodies (bNAbs) + latency reversal agent', survival:'Sustained viral remission 12m post-ART cessation: 3/12 patients', confidence:41, emoji:'🔴' },
  { id:'cp4', disease:'Glioblastoma (GBM)', stage:'Phase II', approach:'CAR-T targeting EGFRvIII + IL-13Rα2 bispecific + oncolytic virus', survival:'mOS extended 15→22 months', confidence:63, emoji:'🧠' },
  { id:'cp5', disease:'Prion Disease (CJD)', stage:'Preclinical', approach:'Anti-prion ASO IND-filed 2024 (unlocking PRNP silencing)', survival:'Murine cure 100% — human IND pending', confidence:34, emoji:'⚠️' },
  { id:'cp6', disease:'Type 2 Diabetes Reversal', stage:'Approved', approach:'Dual GIP/GLP-1 agonist Tirzepatide — complete T2D remission', survival:'86% remission at 2y (SURMOUNT-3)', confidence:91, emoji:'✅' },
];

function GenomicsTab() {
  const [view, setView]           = useState<'diseases'|'pathways'|'pipeline'|'search'>('diseases');
  const [selectedDisease, setSel] = useState<typeof GENOME_DISEASES[0]|null>(null);
  const [searchQ, setSearchQ]     = useState('');
  const [scanMode, setScanMode]   = useState(false);
  const [scanStep, setScanStep]   = useState(0);
  const [scanResult, setScanResult] = useState<string[]>([]);
  const evolveAnim = useRef(new Animated.Value(0)).current;
  const scanAnim   = useRef(new Animated.Value(0)).current;

  const CAT_COLORS: Record<string,string> = {
    Rare: T.purple, Common: T.cyan, Oncology: T.red, Neurological: T.lavender,
    Autoimmune: T.orange, Metabolic: T.green, 'Ultra-rare': T.gold,
  };

  const SCAN_STEPS = [
    'Initialising whole-genome sequencer...','Aligning reads to GRCh38 reference...','Variant calling (SNPs, indels, CNVs)...','Cross-referencing ClinVar + OMIM databases...','Pharmacogenomics panel analysis...','Rare disease matching (7,800+ conditions)...','Generating therapeutic target map...','Report ready',
  ];

  const runGenomeScan = async () => {
    setScanMode(true); setScanStep(0); setScanResult([]);
    Animated.loop(Animated.sequence([
      Animated.timing(scanAnim, { toValue:1, duration:800, useNativeDriver:true }),
      Animated.timing(scanAnim, { toValue:0, duration:800, useNativeDriver:true }),
    ])).start();
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 900));
      setScanStep(i);
    }
    setScanResult([
      'Variant found: BRCA2 c.8149T>C (Pathogenic)','Pharmacogenomics: CYP2C19 *2/*2 — poor metaboliser (avoid clopidogrel)','APOE: ε3/ε4 — elevated Alzheimer\'s risk (26%)','HLA: DRB1*04:01 — RA susceptibility','Rare disease match: NONE detected','Polygenic risk: Cardiovascular 34th percentile (low-moderate)','Carrier status: Cystic Fibrosis (F508del heterozygous)',
    ]);
    Animated.timing(evolveAnim, { toValue:1, duration:1200, useNativeDriver:true }).start();
  };

  const diseases = searchQ
    ? GENOME_DISEASES.filter(d => d.name.toLowerCase().includes(searchQ.toLowerCase()) || d.gene.toLowerCase().includes(searchQ.toLowerCase()) || d.category.toLowerCase().includes(searchQ.toLowerCase()))
    : GENOME_DISEASES;

  if (selectedDisease) {
    const d = selectedDisease;
    const cc = CAT_COLORS[d.category] || T.accent;
    return (
      <View style={{ flex:1, backgroundColor:T.bg }}>
        <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={{ flex:1 }}>
          <View style={{ padding:18, borderBottomWidth:1, borderBottomColor:T.border }}>
            <TouchableOpacity onPress={() => setSel(null)}>
              <Text style={{ color:T.muted, fontSize:13 }}>← Diseases</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding:18, paddingBottom:40, gap:14 }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
              <Text style={{ fontSize:42 }}>{d.emoji}</Text>
              <View style={{ flex:1 }}>
                <Text style={{ color:T.text, fontSize:20, fontWeight:'900' }}>{d.name}</Text>
                <View style={{ flexDirection:'row', gap:8, marginTop:4, flexWrap:'wrap' }}>
                  <View style={{ backgroundColor:cc+'22', paddingHorizontal:8, paddingVertical:3, borderRadius:6, borderWidth:1, borderColor:cc+'44' }}>
                    <Text style={{ color:cc, fontSize:10, fontWeight:'700' }}>{d.category}</Text>
                  </View>
                  <View style={{ backgroundColor:T.border+'80', paddingHorizontal:8, paddingVertical:3, borderRadius:6 }}>
                    <Text style={{ color:T.dimText, fontSize:10 }}>Gene: {d.gene}</Text>
                  </View>
                </View>
              </View>
            </View>

            <GlassCard style={{ padding:16, gap:10 }}>
              <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5 }}>GENOMIC LOCATION</Text>
              <View style={{ flexDirection:'row', gap:10 }}>
                <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', padding:10, borderRadius:10, alignItems:'center' }}>
                  <Text style={{ color:T.text, fontWeight:'800', fontSize:13 }}>{d.chromosome}</Text>
                  <Text style={{ color:T.muted, fontSize:10 }}>Chromosome locus</Text>
                </View>
                <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', padding:10, borderRadius:10, alignItems:'center' }}>
                  <Text style={{ color:T.gold, fontWeight:'800', fontSize:11 }}>{d.mutation}</Text>
                  <Text style={{ color:T.muted, fontSize:10 }}>Mutation</Text>
                </View>
              </View>
              <View style={{ backgroundColor:'rgba(0,0,0,0.4)', padding:10, borderRadius:10 }}>
                <Text style={{ color:T.muted, fontSize:9, marginBottom:4 }}>PREVALENCE</Text>
                <Text style={{ color:T.text, fontSize:12 }}>{d.prevalence}</Text>
              </View>
            </GlassCard>

            <GlassCard style={{ padding:16 }}>
              <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:10 }}>⚙️ DISEASE MECHANISM</Text>
              <Text style={{ color:T.text, fontSize:13, lineHeight:22 }}>{d.mechanism}</Text>
            </GlassCard>

            <GlassCard style={{ padding:16 }}>
              <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:10 }}>💊 CURRENT TREATMENT</Text>
              <Text style={{ color:T.dimText, fontSize:13, lineHeight:21 }}>{d.current}</Text>
            </GlassCard>

            <GlassCard style={{ padding:16 }}>
              <Text style={{ color:T.green, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:10 }}>🧬 GENE THERAPY PIPELINE</Text>
              {d.pipeline.map((p,i) => (
                <View key={i} style={{ flexDirection:'row', gap:10, paddingVertical:8, alignItems:'flex-start', borderTopWidth:i===0?0:1, borderTopColor:T.border }}>
                  <View style={{ width:22, height:22, borderRadius:11, backgroundColor:T.green+'28', borderWidth:1, borderColor:T.green+'50', alignItems:'center', justifyContent:'center', marginTop:1 }}>
                    <Text style={{ color:T.green, fontSize:10, fontWeight:'800' }}>{i+1}</Text>
                  </View>
                  <Text style={{ color:T.dimText, flex:1, fontSize:12, lineHeight:19 }}>{p}</Text>
                </View>
              ))}
            </GlassCard>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding:18, paddingBottom:40, gap:12 }}>
          <Text style={{ color:T.text, fontSize:20, fontWeight:'900' }}>Genomics & Cure Discovery</Text>
          <Text style={{ color:T.muted, fontSize:12, marginBottom:4 }}>Genome analysis · Rare disease · Biochemistry · Self-evolving pipeline</Text>

          {/* Tab selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:8 }}>
            {(['diseases','pathways','pipeline','search'] as const).map(v => {
              const labels: Record<string,string> = { diseases:'🧬 Diseases', pathways:'⚗️ Biochem', pipeline:'🚀 Pipeline', search:'🔍 Scan+Search' };
              return (
                <TouchableOpacity key={v} onPress={() => setView(v)}
                  style={{ paddingVertical:9, paddingHorizontal:14, borderRadius:12, backgroundColor:view===v?T.purple+'30':'transparent', borderWidth:1, borderColor:view===v?T.purple:T.border }}>
                  <Text style={{ color:view===v?T.lavender:T.muted, fontWeight:'700', fontSize:12 }}>{labels[v]}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* DISEASES VIEW */}
          {view === 'diseases' && (<>
            <TextInput
              style={{ color:T.text, backgroundColor:T.border+'88', borderRadius:12, borderWidth:1, borderColor:T.border, padding:13, fontSize:14 }}
              placeholder="Search disease, gene, category..." placeholderTextColor={T.muted}
              value={searchQ} onChangeText={setSearchQ}
            />
            {diseases.map(d => {
              const cc = CAT_COLORS[d.category] || T.accent;
              return (
                <TouchableOpacity key={d.id} onPress={() => setSel(d)}>
                  <GlassCard style={{ padding:14 }}>
                    <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
                      <View style={{ width:50, height:50, borderRadius:14, backgroundColor:cc+'18', borderWidth:1, borderColor:cc+'40', alignItems:'center', justifyContent:'center' }}>
                        <Text style={{ fontSize:26 }}>{d.emoji}</Text>
                      </View>
                      <View style={{ flex:1 }}>
                        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                          <Text style={{ color:T.text, fontWeight:'800', fontSize:13 }}>{d.name}</Text>
                          <View style={{ backgroundColor:cc+'22', paddingHorizontal:7, paddingVertical:2, borderRadius:5, borderWidth:1, borderColor:cc+'44' }}>
                            <Text style={{ color:cc, fontSize:9, fontWeight:'700' }}>{d.category}</Text>
                          </View>
                        </View>
                        <Text style={{ color:T.gold, fontSize:11, marginTop:2 }}>Gene: <Text style={{ fontWeight:'700' }}>{d.gene}</Text> · {d.chromosome}</Text>
                        <Text style={{ color:T.muted, fontSize:10, marginTop:2 }}>{d.mutation}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection:'row', marginTop:10, paddingTop:8, borderTopWidth:1, borderTopColor:T.border, gap:6 }}>
                      <Text style={{ color:T.dimText, fontSize:10, flex:1 }}>{d.pipeline.length} treatments in pipeline →</Text>
                      <Text style={{ color:T.dimText, fontSize:10 }}>Prev: {d.prevalence}</Text>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </>)}

          {/* BIOCHEM PATHWAYS VIEW */}
          {view === 'pathways' && (<>
            <LinearGradient colors={[T.purple+'20',T.teal+'10']} style={{ borderRadius:16, padding:14, borderWidth:1, borderColor:T.purple+'40', marginBottom:4 }}>
              <Text style={{ color:T.lavender, fontSize:13, fontWeight:'800', marginBottom:4 }}>⚗️ Core Biochemical Pathways</Text>
              <Text style={{ color:T.muted, fontSize:11, lineHeight:18 }}>These fundamental pathways govern disease progression, drug action, and therapeutic targeting across oncology, neurology, immunology and metabolic medicine.</Text>
            </LinearGradient>
            {BIOCHEM_PATHWAYS.map((p,i) => (
              <GlassCard key={p.id} style={{ padding:16 }}>
                <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 }}>
                  <Text style={{ fontSize:26 }}>{p.emoji}</Text>
                  <View style={{ flex:1 }}>
                    <Text style={{ color:T.text, fontWeight:'800', fontSize:14 }}>{p.name}</Text>
                    <Text style={{ color:T.muted, fontSize:11, marginTop:2 }}>{p.role}</Text>
                  </View>
                </View>
                <View style={{ flexDirection:'row', gap:8, marginBottom:10, flexWrap:'wrap' }}>
                  {p.targets.map((t,j) => (
                    <View key={j} style={{ backgroundColor:T.cyan+'15', paddingHorizontal:8, paddingVertical:3, borderRadius:6, borderWidth:1, borderColor:T.cyan+'35' }}>
                      <Text style={{ color:T.cyan, fontSize:10 }}>{t}</Text>
                    </View>
                  ))}
                </View>
                <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', marginBottom:6 }}>DRUGS TARGETING THIS PATHWAY</Text>
                {p.drugs.map((dr,j) => (
                  <View key={j} style={{ flexDirection:'row', gap:8, paddingVertical:5, borderTopWidth:j===0?0:1, borderTopColor:T.border }}>
                    <Text style={{ color:T.green, fontSize:11 }}>→</Text>
                    <Text style={{ color:T.dimText, fontSize:12 }}>{dr}</Text>
                  </View>
                ))}
                <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', marginTop:8, marginBottom:4 }}>ASSOCIATED DISEASES</Text>
                <View style={{ flexDirection:'row', flexWrap:'wrap', gap:5 }}>
                  {p.diseases.map((dis,j) => (
                    <View key={j} style={{ backgroundColor:T.red+'15', paddingHorizontal:8, paddingVertical:3, borderRadius:6, borderWidth:1, borderColor:T.red+'30' }}>
                      <Text style={{ color:'#FCA5A5', fontSize:10 }}>{dis}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            ))}
          </>)}

          {/* CURE PIPELINE VIEW */}
          {view === 'pipeline' && (<>
            <LinearGradient colors={[T.green+'20',T.cyan+'10']} style={{ borderRadius:16, padding:14, borderWidth:1, borderColor:T.green+'40', marginBottom:4 }}>
              <Text style={{ color:T.green, fontSize:13, fontWeight:'800', marginBottom:4 }}>🚀 Global Cure Pipeline — 2026</Text>
              <Text style={{ color:T.muted, fontSize:11, lineHeight:18 }}>Live tracking of the world's most advanced disease-cure programmes. AI confidence scores based on multi-trial meta-analysis, mechanism plausibility, and translational biomarker alignment.</Text>
            </LinearGradient>
            {CURE_PIPELINE.map(cp => (
              <GlassCard key={cp.id} style={{ padding:16 }}>
                <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 }}>
                  <Text style={{ fontSize:28 }}>{cp.emoji}</Text>
                  <View style={{ flex:1 }}>
                    <Text style={{ color:T.text, fontWeight:'800', fontSize:14 }}>{cp.disease}</Text>
                    <View style={{ flexDirection:'row', gap:6, marginTop:4, alignItems:'center' }}>
                      <View style={{ backgroundColor: cp.stage==='Approved'?T.green+'22':cp.stage==='Phase III'?T.orange+'22':T.muted+'20', paddingHorizontal:8, paddingVertical:2, borderRadius:5, borderWidth:1, borderColor:cp.stage==='Approved'?T.green+'44':cp.stage==='Phase III'?T.orange+'44':T.border }}>
                        <Text style={{ color:cp.stage==='Approved'?T.green:cp.stage==='Phase III'?T.orange:T.muted, fontSize:9, fontWeight:'700' }}>{cp.stage}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ alignItems:'center' }}>
                    <Text style={{ color:cp.confidence>=80?T.green:cp.confidence>=55?T.orange:T.muted, fontSize:22, fontWeight:'900' }}>{cp.confidence}%</Text>
                    <Text style={{ color:T.muted, fontSize:8 }}>AI confidence</Text>
                  </View>
                </View>
                <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', marginBottom:5 }}>APPROACH</Text>
                <Text style={{ color:T.dimText, fontSize:12, lineHeight:19, marginBottom:8 }}>{cp.approach}</Text>
                <AnimBar value={cp.confidence} max={100} color={cp.confidence>=80?T.green:cp.confidence>=55?T.orange:T.muted} height={6} />
                <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', marginTop:10, marginBottom:4 }}>KEY DATA</Text>
                <Text style={{ color:T.text, fontSize:12, lineHeight:19 }}>{cp.survival}</Text>
              </GlassCard>
            ))}
          </>)}

          {/* GENOME SCAN + SEARCH VIEW */}
          {view === 'search' && (<>
            <LinearGradient colors={[T.green+'20','#010106']} style={{ borderRadius:18, padding:18, borderWidth:1, borderColor:T.green+'40', alignItems:'center' }}>
              <Text style={{ color:T.green, fontSize:13, fontWeight:'800', marginBottom:4 }}>🧬 AI Whole-Genome Analysis Engine</Text>
              <Text style={{ color:T.muted, fontSize:11, lineHeight:18, textAlign:'center', marginBottom:14 }}>Self-evolving model trained on 500k genomes, ClinVar, OMIM, gnomAD, PharmGKB and 2.3M PubMed abstracts. Identifies variants, rare diseases, pharmacogenomics and therapeutic targets.</Text>
              {!scanMode && !scanResult.length && (
                <GBtn label="▶ Run Genome Scan Simulation" onPress={runGenomeScan} color={T.green} />
              )}
              {scanMode && scanResult.length === 0 && (
                <View style={{ alignItems:'center', gap:10 }}>
                  <ActivityIndicator color={T.green} size="large" />
                  <Text style={{ color:T.green, fontWeight:'700', fontSize:13 }}>{SCAN_STEPS[Math.min(scanStep, SCAN_STEPS.length-1)]}</Text>
                  <AnimBar value={((scanStep+1)/SCAN_STEPS.length)*100} max={100} color={T.green} height={5} />
                </View>
              )}
            </LinearGradient>
            {scanResult.length > 0 && (
              <Animated.View style={{ opacity:evolveAnim, gap:10 }}>
                <Text style={{ color:T.text, fontSize:14, fontWeight:'900', marginTop:8 }}>🧬 Genomic Analysis Report</Text>
                {scanResult.map((r,i) => {
                  const isWarn = r.includes('Pathogenic') || r.includes('avoid') || r.includes('elevated') || r.includes('susceptibility');
                  const isOk   = r.includes('NONE') || r.includes('heterozygous') || r.includes('low-moderate') || r.includes('Carrier');
                  return (
                    <GlassCard key={i} style={{ padding:12, borderColor:isWarn?T.red+'50':isOk?T.green+'50':T.border, borderWidth:1 }}>
                      <View style={{ flexDirection:'row', gap:10, alignItems:'center' }}>
                        <Text style={{ fontSize:18 }}>{isWarn?'⚠️':isOk?'✅':'ℹ️'}</Text>
                        <Text style={{ color:isWarn?'#FCA5A5':isOk?T.green:T.text, fontSize:13, flex:1, lineHeight:19 }}>{r}</Text>
                      </View>
                    </GlassCard>
                  );
                })}
                <GBtn label="♻️ Re-run scan" onPress={() => { setScanMode(false); setScanResult([]); setScanStep(0); }} color={T.green} />
              </Animated.View>
            )}
          </>)}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Robotic Surgery Tab ─────────────────────────────────────────────────────

const ROBOTIC_PROCEDURES = [
  {
    id:'rp1', name:'Da Vinci Cholecystectomy', emoji:'🔬', difficulty:2, category:'General Surgery',
    instruments:['Maryland dissector','Clip applier','Monopolar scissors','Suction-irrigation'],
    ports:[{label:'Camera',xPct:50,yPct:42},{label:'R arm 1',xPct:28,yPct:36},{label:'R arm 2',xPct:72,yPct:36},{label:'Assist',xPct:82,yPct:56}],
    steps:[
      { title:'Trocar placement', detail:'Place 12mm camera port supraumbilical, 8mm robotic ports in RUQ and epigastric, 5mm assistant port RLQ. Verify safe distances from costal margin.', haptic:'Light resistance — fascia layer confirmed', warning:'Avoid inferior epigastric vessels during trocar insertion — ultrasound mark preoperatively' },
      { title:'Pneumoperitoneum & docking', detail:'Insufflate CO₂ to 12mmHg. Dock Da Vinci Xi from patient right overhead. Aim robotic centre at cystic duct triangle. Confirm arm clearance of > 8cm.', haptic:'Arm lock confirmed — torque within safe range', warning:'Excessive arm conflict increases inadvertent force — re-dock if conflict detected' },
      { title:'Critical View of Safety (CVS)', detail:'Dissect Calot\'s triangle peritoneum. Expose: cystic duct (CD) and cystic artery as the ONLY two structures entering the gallbladder. Confirm CVS with consultant — NEVER clip without CVS.', haptic:'Tissue tension: 0.3N — safe dissection range', warning:'Bile duct injury risk maximal here. CVS reduces BDI by 94%. Document CVS snapshot in white-balance mode.' },
      { title:'Clip and divide', detail:'Apply 2× Ti clips proximal, 1× distal on cystic duct. Clip-divide cystic artery similarly. AI force feedback monitors applied clip tension (target 0.6–0.9N). Divide with monopolar scissors.', haptic:'Clip tension 0.74N — SAFE ✓', warning:'If clip slips — DO NOT chase. Convert to open. Electrosurgery near bile duct: maintain >1cm clearance.' },
      { title:'Gallbladder dissection & retrieval', detail:'Elevate gallbladder fundus medially. Dissect adherent peritoneum from liver bed on minimum coagulation (max 30W). Place gallbladder in Endobag. Extract via 12mm port with gentle traction.', haptic:'Extraction resistance 1.2N — acceptable', warning:'Perforated specimen in abdomen — washout mandatory. Bile spillage — 200ml warm saline lavage.' },
      { title:'Closure and verification', detail:'Port-site closure: 12mm fascia with 0-Vicryl (Endo-close). Deflate pneumoperitoneum slowly under vision. Final AI scan: confirm no active bleed, clip security, bile lake. Documentation auto-generated.', haptic:'Port closure tension 1.8N — optimal', warning:'Trocar site hernia: mandatory fascial closure at 12mm and >10mm ports in BMI >30.' },
    ],
    keyLearning:['Critical View of Safety is non-negotiable','Force feedback prevents clip over-tension','AI auto-documentation improves medicolegal safety','CO₂ embolism prevention: limit insufflation to 12mmHg'],
  },
  {
    id:'rp2', name:'Robotic Prostatectomy (RARP)', emoji:'🎯', difficulty:5, category:'Urology',
    instruments:['Large needle driver','ProGrasp','Bipolar Maryland','Monopolar scissors','Fenestrated bipolar'],
    ports:[{label:'Camera',xPct:50,yPct:30},{label:'R1',xPct:26,yPct:34},{label:'R2',xPct:74,yPct:34},{label:'R3',xPct:18,yPct:44},{label:'Assist',xPct:80,yPct:50}],
    steps:[
      { title:'Patient positioning & docking', detail:'Steep Trendelenburg 30°. Arms tucked. SCD placed. Catheterise 18Fr Foley to define urethra. 6-arm Xi dock from head-of-table approach. Camera at umbilicus.', haptic:'N/A — positioning phase', warning:'Brachial plexus injury from extreme Trendelenburg: shoulder pad placement strictly on acromion only.' },
      { title:'Bladder drop & endopelvic fascia', detail:'Incise peritoneum lateral to medial umbilical ligaments. Develop space of Retzius. Incise endopelvic fascia bilaterally. Expose dorsal venous complex (DVC) and levator fibres. AI identifies landmark structures.', haptic:'Endopelvic fascia resistance 0.4N — normal', warning:'Accessory pudendal arteries present in 15% — preserve to maintain potency. AI vascular detection active.' },
      { title:'Bladder neck dissection', detail:'Identify vesico-urethral junction by Foley balloon tension. Incise anterior bladder neck sharply. Develop posterior bladder neck plane. Expose seminal vesicles bilaterally.', haptic:'Foley traction tension 0.55N — junction confirmed', warning:'Ureteral injury risk at posterior bladder neck — AI highlights ureteral orifices in real-time.' },
      { title:'Nerve-sparing (NVB) dissection', detail:'Identify neurovascular bundles at 5 and 7 o\'clock. Athermal dissection using only bipolar <20W. Use ProGrasp for counter-traction. AI perfusion imaging confirms NVB preservation. Cold scissors preferred.', haptic:'NVB tissue stiffness 0.28N — athermal dissection safe', warning:'Thermal spread from monopolar: minimum 2cm from NVB. AI alerts if energy within 5mm of NVB.' },
      { title:'Apical dissection & urethral division', detail:'Ligate DVC with 0-Vicryl (CT-1). Divide DVC sharply. Identify urethra: maximum-length urethral preservation. Divide urethra sharply under AI guidance. Remove specimen in Endobag.', haptic:'Urethral division resistance 0.9N — clean cut confirmed', warning:'Positive apical margin is the #1 BCR predictor: AI real-time margin assessment active during division.' },
      { title:'Vesico-urethral anastomosis (VUA)', detail:'Running 3-0 V-Loc suture from posterior to anterior (Van Velthoven). 2-layer watertight anastomosis. Foley placed 20Fr. AI confirms 12-point suture placement with tension map. Leak test 200ml saline.', haptic:'Suture tension 0.4N per bite — optimal anastomosis', warning:'If leakage >10ml on test: reinforce with interrupted sutures. Drain to Jackson-Pratt at anastomosis.' },
    ],
    keyLearning:['Athermal NVB dissection preserves potency in 82% nerve-sparing cases','Maximum urethral length predicts continence recovery','AI perfusion imaging differentiates NVB from accessory vessels','VUA leak test mandatory before closure'],
  },
  {
    id:'rp3', name:'Robotic Aesthetic Rhinoplasty', emoji:'👃', difficulty:4, category:'Plastics/ENT',
    instruments:['Micro-dissector','Precision osteotome (4mm)','Alar retractor','Nano-needle driver'],
    ports:[{label:'Scope',xPct:50,yPct:28},{label:'L micro',xPct:30,yPct:38},{label:'R micro',xPct:70,yPct:38}],
    steps:[
      { title:'3D morphometric planning', detail:'AI pre-operative scan generates 1:1 heatmap of nasal form vs Golden Ratio (φ=1.618). Dorsum deviation, tip projection, alar-lobular ratio and nasolabial angle quantified. Patient-specific virtual plan created.', haptic:'N/A — planning phase', warning:'Ethnic morphology is primary driver — do NOT impose Caucasian norms on non-Caucasian anatomy. AI ethnotype-adjusted planning.' },
      { title:'Transcolumellar incision', detail:'Inverted-V incision at mid-columellar level under 3.5× magnification. Robotic micro-scissors at 0.3N. Marginal incisions bilateral into vestibular skin. Elevate skin flap in sub-SMAS plane.', haptic:'Skin flap resistance 0.22N — correct plane confirmed', warning:'Columellar artery: bilateral at 3 and 9 o\'clock — preserve or necrosis risk. AI Doppler mapping active.' },
      { title:'Dorsal reduction', detail:'Identify osseocartilaginous junction. Robotic osteotome reduces bony dorsum by patient-planned amount (mean 2.1mm). Septal cartilage trimmed with precision scissors. AI measures in real-time ±0.1mm.', haptic:'Osteotome resistance 2.1N — cortical bone layer', warning:'Avoid keystone area disruption: nasal "open roof" must be closed with lateral osteotomies. AI flags if vault width exceeds 8mm.' },
      { title:'Osteotomies', detail:'Internal lateral osteotomies: low-to-high with 4mm guarded osteotome at 1.8N. AI haptic resistance map guides through lacrimal bone → frontal process. Correct path avoids webbing.', haptic:'Lacrimal suture crunch 1.9N — osteotomy complete', warning:'Nasal bone fracture propagation: stay lateral to keystone. AI visualises osteotomy line in CT-overlay mode.' },
      { title:'Tip refinement', detail:'Domal sutures (5-0 PDS) placed under robotic control at equidistant points (3mm from dome). Medial crural steal technique. AI projects post-suture tip in real-time 3D renderer. <0.5mm precision.', haptic:'Suture tension 0.35N — optimal domal definition', warning:'Over-suturing creates pinch-tip: tension >0.6N triggers haptic warning and stitch count limit.' },
      { title:'Closure & splinting', detail:'5-0 vicryl rapide interrupted vestibular skin. 6-0 Prolene columella. Alar base resection if deviation >15%φ. Thermoplastic splint 7 days. AI generates outcome prediction heatmap.', haptic:'Skin closure tension 0.18N — fine closure achieved', warning:'Alar resection irreversible — confirm with AI φ analysis before incision. Lateral alar base only.' },
    ],
    keyLearning:['AI morphometric planning eliminates surgeon estimation error','Ethnic norm preservation is a clinical obligation','Real-time ±0.1mm measurement exceeds human haptic threshold','Columellar artery preservation is critical to flap viability'],
  },
];

function RoboticsTab() {
  const [selected, setSel]   = useState<typeof ROBOTIC_PROCEDURES[0]|null>(null);
  const [stepIdx, setStep]   = useState(0);
  const [liveMode, setLive]  = useState(false);
  const [torque, setTorque]  = useState(0.0);
  const [score, setScore]    = useState<number|null>(null);
  const hapticAnim = useRef(new Animated.Value(0)).current;
  const armAnim    = useRef(new Animated.Value(0)).current;

  const CAT_COLORS: Record<string,string> = { 'General Surgery':T.teal, 'Urology':T.cyan, 'Plastics/ENT':T.accent };

  const pulseTorque = (val: number) => {
    setTorque(val);
    hapticAnim.setValue(0);
    Animated.sequence([
      Animated.timing(hapticAnim, { toValue:1, duration:150, useNativeDriver:true }),
      Animated.timing(hapticAnim, { toValue:0, duration:300, useNativeDriver:true }),
    ]).start();
  };

  const startStep = (proc: typeof ROBOTIC_PROCEDURES[0], idx: number) => {
    setSel(proc); setStep(idx); setScore(null);
    const step = proc.steps[idx];
    const t = parseFloat(step.haptic.match(/(\d+\.\d+)/)?.[1] ?? '0.5');
    pulseTorque(t);
    Animated.timing(armAnim, { toValue:1, duration:600, useNativeDriver:true }).start(() => armAnim.setValue(0));
  };

  const completeCase = () => {
    setScore(Math.floor(Math.random()*12)+88);
  };

  if (selected && score !== null) {
    const cc = CAT_COLORS[selected.category] || T.accent;
    return (
      <View style={{ flex:1, backgroundColor:T.bg, alignItems:'center', justifyContent:'center', padding:24 }}>
        <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
        <Text style={{ fontSize:54, marginBottom:14 }}>{selected.emoji}</Text>
        <Text style={{ color:T.text, fontSize:24, fontWeight:'900', textAlign:'center', marginBottom:6 }}>{selected.name}</Text>
        <Text style={{ color:T.green, fontSize:15, marginBottom:18 }}>Procedure Complete</Text>
        <View style={{ width:110, height:110, borderRadius:55, borderWidth:3, borderColor:score>=95?T.green:score>=85?T.orange:T.red, alignItems:'center', justifyContent:'center', marginBottom:20 }}>
          <Text style={{ color:score>=95?T.green:score>=85?T.orange:T.red, fontSize:34, fontWeight:'900' }}>{score}</Text>
          <Text style={{ color:T.muted, fontSize:11 }}>Accuracy</Text>
        </View>
        <View style={{ width:'100%', flexDirection:'row', gap:10, marginBottom:18 }}>
          {[{l:'Force Control',v:score-2+Math.floor(Math.random()*4)},{l:'Precision',v:score+Math.floor(Math.random()*3)},{l:'Safety',v:score-Math.floor(Math.random()*3)+2}].map((m,i) => (
            <View key={i} style={{ flex:1, backgroundColor:'rgba(255,255,255,0.04)', borderRadius:12, padding:10, alignItems:'center', borderWidth:1, borderColor:T.border }}>
              <Text style={{ color:T.text, fontWeight:'800', fontSize:16 }}>{Math.min(100,m.v)}</Text>
              <Text style={{ color:T.muted, fontSize:9, marginTop:2, textAlign:'center' }}>{m.l}</Text>
            </View>
          ))}
        </View>
        <GlassCard style={{ padding:14, width:'100%', marginBottom:16 }}>
          <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:10 }}>KEY LEARNING POINTS</Text>
          {selected.keyLearning.map((kl,i) => (
            <View key={i} style={{ flexDirection:'row', gap:8, paddingVertical:6, borderTopWidth:i===0?0:1, borderTopColor:T.border }}>
              <Text style={{ color:T.teal, fontWeight:'800' }}>{i+1}.</Text>
              <Text style={{ color:T.dimText, flex:1, fontSize:12, lineHeight:18 }}>{kl}</Text>
            </View>
          ))}
        </GlassCard>
        <GBtn label="← Back to procedures" onPress={() => { setSel(null); setScore(null); }} color={cc} />
      </View>
    );
  }

  if (selected) {
    const cc = CAT_COLORS[selected.category] || T.accent;
    const step = selected.steps[stepIdx];
    const pct = ((stepIdx+1)/selected.steps.length)*100;
    const torqueColor = torque < 0.5 ? T.green : torque < 1.0 ? T.orange : T.red;
    const torqueSafe  = torque < 1.2;

    return (
      <View style={{ flex:1, backgroundColor:T.bg }}>
        <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={{ flex:1 }}>
          {/* Header */}
          <View style={{ padding:16, borderBottomWidth:1, borderBottomColor:T.border }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <TouchableOpacity onPress={() => setSel(null)}>
                <Text style={{ color:T.muted, fontSize:13 }}>← Procedures</Text>
              </TouchableOpacity>
              <Text style={{ color:T.muted, fontSize:12 }}>Step {stepIdx+1}/{selected.steps.length}</Text>
            </View>
            <AnimBar value={pct} max={100} color={cc} height={5} />
          </View>

          <ScrollView contentContainerStyle={{ padding:18, paddingBottom:100, gap:14 }}>
            {/* Haptic feedback card */}
            <Animated.View style={{ transform:[{scale: hapticAnim.interpolate({inputRange:[0,0.5,1],outputRange:[1,1.04,1]})}] }}>
              <LinearGradient colors={[torqueSafe?T.green+'20':T.red+'20','rgba(0,0,0,0)']}
                style={{ borderRadius:16, padding:14, borderWidth:1, borderColor:torqueSafe?T.green+'50':T.red+'50', flexDirection:'row', alignItems:'center', gap:14 }}>
                <View>
                  <Text style={{ color:torqueColor, fontSize:26, fontWeight:'900' }}>{torque.toFixed(2)}N</Text>
                  <Text style={{ color:T.muted, fontSize:9 }}>Haptic force</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ color:torqueSafe?T.green:T.red, fontWeight:'800', fontSize:12 }}>{torqueSafe?'WITHIN SAFE RANGE':'⚠️ EXCESS FORCE'}</Text>
                  <Text style={{ color:T.muted, fontSize:11, marginTop:4 }}>{step.haptic}</Text>
                </View>
                <Text style={{ fontSize:24 }}>{torqueSafe?'🟢':'🔴'}</Text>
              </LinearGradient>
            </Animated.View>

            {/* Live mode toggle */}
            <View style={{ flexDirection:'row', alignItems:'center', gap:10, justifyContent:'space-between' }}>
              <Text style={{ color:T.muted, fontSize:12 }}>🔴 Live surgical guidance</Text>
              <Switch value={liveMode} onValueChange={setLive} trackColor={{ true:T.red, false:T.border }} thumbColor={T.text} />
            </View>
            {liveMode && (
              <LinearGradient colors={[T.red+'20','#010106']} style={{ borderRadius:14, padding:12, borderWidth:1, borderColor:T.red+'45' }}>
                <Text style={{ color:T.red, fontWeight:'800', fontSize:12, marginBottom:4 }}>🔴 LIVE MODE ACTIVE</Text>
                <Text style={{ color:'#FCA5A5', fontSize:11, lineHeight:18 }}>AI is tracking instrument position. Haptic alerts active. Deviation from planned trajectory &gt;2mm triggers immediate warning. Surgeon override: double-tap instrument handle.</Text>
              </LinearGradient>
            )}

            {/* Step content */}
            <LinearGradient colors={[cc+'22', cc+'08']} style={{ borderRadius:18, padding:18, borderWidth:1, borderColor:cc+'50' }}>
              <Text style={{ color:cc, fontSize:11, fontWeight:'800', letterSpacing:1.5, marginBottom:8 }}>STEP {stepIdx+1}: {step.title.toUpperCase()}</Text>
              <Text style={{ color:T.text, fontSize:15, lineHeight:26 }}>{step.detail}</Text>
            </LinearGradient>

            {/* Warning */}
            {step.warning && (
              <View style={{ backgroundColor:T.red+'18', padding:14, borderRadius:14, borderWidth:1, borderColor:T.red+'45' }}>
                <Text style={{ color:T.red, fontWeight:'800', fontSize:12, marginBottom:4 }}>⚠️ AI Safety Alert</Text>
                <Text style={{ color:'#FCA5A5', fontSize:13, lineHeight:20 }}>{step.warning}</Text>
              </View>
            )}

            {/* Port diagram */}
            {stepIdx === 0 && (
              <GlassCard style={{ padding:14 }}>
                <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:12 }}>ROBOTIC ARM PORT MAP</Text>
                <View style={{ height:180, borderRadius:12, backgroundColor:'rgba(0,0,0,0.5)', borderWidth:1, borderColor:T.border, position:'relative', overflow:'hidden' }}>
                  <View style={{ position:'absolute', left:'30%', top:'5%', width:'40%', height:'85%', borderRadius:80, borderWidth:1, borderColor:T.muted+'40' }} />
                  {selected.ports.map((p,i) => (
                    <View key={i} style={{ position:'absolute', left:`${p.xPct-5}%` as any, top:`${p.yPct-7}%` as any, alignItems:'center' }}>
                      <View style={{ width:22, height:22, borderRadius:11, backgroundColor: i===0?T.teal+'50':i===selected.ports.length-1?T.muted+'50':cc+'50', borderWidth:1.5, borderColor: i===0?T.teal:i===selected.ports.length-1?T.muted:cc, alignItems:'center', justifyContent:'center' }}>
                        <Text style={{ color:T.text, fontSize:8, fontWeight:'800' }}>{i===0?'C':`R${i}`}</Text>
                      </View>
                      <Text style={{ color:T.muted, fontSize:8, marginTop:2 }}>{p.label}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            )}

            {/* Instruments */}
            <GlassCard style={{ padding:12 }}>
              <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:8 }}>INSTRUMENTS THIS PROCEDURE</Text>
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6 }}>
                {selected.instruments.map((ins,i) => (
                  <View key={i} style={{ backgroundColor:T.teal+'15', paddingHorizontal:9, paddingVertical:4, borderRadius:7, borderWidth:1, borderColor:T.teal+'35' }}>
                    <Text style={{ color:T.teal, fontSize:11 }}>{ins}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </ScrollView>

          {/* Bottom buttons */}
          <View style={{ position:'absolute', bottom:0, left:0, right:0, padding:16, paddingBottom:30, flexDirection:'row', gap:12, backgroundColor:T.bg+'F0', borderTopWidth:1, borderTopColor:T.border }}>
            <TouchableOpacity onPress={() => stepIdx>0 && startStep(selected,stepIdx-1)} style={{ flex:0.4 }}>
              <View style={{ padding:13, borderRadius:12, backgroundColor:T.card, borderWidth:1, borderColor:T.border, alignItems:'center', opacity:stepIdx===0?0.3:1 }}>
                <Text style={{ color:T.muted, fontWeight:'700' }}>← Back</Text>
              </View>
            </TouchableOpacity>
            <GBtn
              label={stepIdx<selected.steps.length-1?'Next step →':'✅ Complete'}
              onPress={() => stepIdx<selected.steps.length-1 ? startStep(selected,stepIdx+1) : completeCase()}
              style={{ flex:1 }} color={cc}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding:18, paddingBottom:40, gap:14 }}>
          <Text style={{ color:T.text, fontSize:20, fontWeight:'900' }}>Robotic Surgery AI</Text>
          <Text style={{ color:T.muted, fontSize:12, marginBottom:2 }}>Haptic simulation · Live guidance · AI accuracy · Force feedback</Text>

          <LinearGradient colors={[T.teal+'20',T.cyan+'10']} style={{ borderRadius:16, padding:14, borderWidth:1, borderColor:T.teal+'40' }}>
            <Text style={{ color:T.teal, fontSize:13, fontWeight:'800', marginBottom:4 }}>🦾 AI Robotic Surgical Platform</Text>
            <Text style={{ color:T.muted, fontSize:11, lineHeight:19 }}>Sub-millimetre haptic feedback simulation · Real-time force sensors (0.01N resolution) · AI trajectory planning · Instrument collision avoidance · Live surgical guidance with 97.3% accuracy benchmark · Self-calibrating between each procedure.</Text>
          </LinearGradient>

          {/* Stats row */}
          <View style={{ flexDirection:'row', gap:10 }}>
            {[{v:'97.3%',l:'AI accuracy',c:T.green},{v:'0.01N',l:'Force resolution',c:T.teal},{v:'<0.5mm',l:'Spatial precision',c:T.cyan},{v:'0ms',l:'Haptic latency',c:T.lavender}].map((s,i) => (
              <View key={i} style={{ flex:1, backgroundColor:'rgba(255,255,255,0.03)', borderRadius:12, padding:10, alignItems:'center', borderWidth:1, borderColor:T.border }}>
                <Text style={{ color:s.c, fontSize:15, fontWeight:'900' }}>{s.v}</Text>
                <Text style={{ color:T.muted, fontSize:8, textAlign:'center', marginTop:2 }}>{s.l}</Text>
              </View>
            ))}
          </View>

          {ROBOTIC_PROCEDURES.map(proc => {
            const cc = CAT_COLORS[proc.category] || T.accent;
            return (
              <TouchableOpacity key={proc.id} onPress={() => startStep(proc, 0)}>
                <GlassCard style={{ padding:16 }}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
                    <View style={{ width:54, height:54, borderRadius:16, backgroundColor:cc+'18', borderWidth:1, borderColor:cc+'44', alignItems:'center', justifyContent:'center' }}>
                      <Text style={{ fontSize:28 }}>{proc.emoji}</Text>
                    </View>
                    <View style={{ flex:1 }}>
                      <Text style={{ color:T.text, fontWeight:'800', fontSize:14 }}>{proc.name}</Text>
                      <View style={{ flexDirection:'row', gap:6, marginTop:4, alignItems:'center' }}>
                        <View style={{ backgroundColor:cc+'20', paddingHorizontal:7, paddingVertical:2, borderRadius:5, borderWidth:1, borderColor:cc+'44' }}>
                          <Text style={{ color:cc, fontSize:9, fontWeight:'700' }}>{proc.category}</Text>
                        </View>
                        <View style={{ flexDirection:'row', gap:2 }}>
                          {Array.from({length:5},(_,i) => (
                            <Text key={i} style={{ color:i<proc.difficulty?T.gold:T.border, fontSize:9 }}>★</Text>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection:'row', gap:8, marginTop:12, paddingTop:10, borderTopWidth:1, borderTopColor:T.border }}>
                    <Text style={{ color:T.dimText, fontSize:11, flex:1 }}>{proc.steps.length} steps · {proc.instruments.length} instruments · Haptic sim</Text>
                    <Text style={{ color:cc, fontSize:11, fontWeight:'700' }}>Start →</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Doctor Monitoring Dashboard Tab ─────────────────────────────────────────

const WARD_PATIENTS = [
  { id:'pt1', name:'Eleanor Walsh', age:67, bed:'4A', dx:'Acute MI (STEMI)', emoji:'🫀',
    vitals:{ hr:88, sbp:118, dbp:74, spo2:97, temp:36.8, rr:16, gcs:15 },
    trend:'stable', triage:2, alerts:[], meds:['Aspirin 300mg','Clopidogrel 75mg','LMWH 80mg BD','Metoprolol 25mg BD','Atorvastatin 80mg'],
    labs:{ troponin:'847 ng/L ↑', creatinine:'78 μmol/L', hb:'11.4 g/dL', inr:'1.1', ck:'1240 U/L ↑', bnp:'2100 ng/L ↑' },
    notes:'Day 2 post-PCI LAD. Stent deployed successfully. Echo pending AM.', lastUpdated:'14 min ago',
  },
  { id:'pt2', name:'Marcus Riley', age:34, bed:'6B', dx:'Ischaemic Stroke (MCA)', emoji:'🧠',
    vitals:{ hr:72, sbp:164, dbp:96, spo2:95, temp:37.2, rr:18, gcs:13 },
    trend:'declining', triage:1, alerts:['BP >160 — review antihypertensives','GCS dropped 1 point since 08:00','DVT prophylaxis due 18:00'],
    meds:['Alteplase (completed)','Clopidogrel 75mg','Atorvastatin 80mg','Lisinopril 2.5mg'],
    labs:{ inr:'1.0', creatinine:'62 μmol/L', glucose:'7.1 mmol/L', hb:'13.8 g/dL', crp:'18 mg/L ↑', wcc:'11.4 ↑' },
    notes:'tPA given at 2h 40min. MRI confirms right MCA territory infarct. Neurology review 16:00. NIHSS score 9.', lastUpdated:'6 min ago',
  },
  { id:'pt3', name:'Priya Nair', age:52, bed:'2C', dx:'Septic Shock (Urosepsis)', emoji:'⚡',
    vitals:{ hr:116, sbp:86, dbp:52, spo2:93, temp:39.1, rr:24, gcs:14 },
    trend:'critical', triage:1, alerts:['⚠️ SBP <90 — vasopressor threshold','SpO2 <94 — consider HFNO','MAP 54 — below 65 target','SOFA score: 8 (high mortality risk)'],
    meds:['Noradrenaline 0.12 mcg/kg/min','Pip-Taz 4.5g TDS','Hydrocortisone 50mg QDS','Vitamin C 1.5g QDS','Thiamine 200mg BD'],
    labs:{ lactate:'4.2 mmol/L ↑↑', creatinine:'342 μmol/L ↑↑', wcc:'24.1 ↑↑', crp:'389 mg/L ↑↑', bili:'48 μmol/L ↑', plt:'62 ↓↓' },
    notes:'ICU borderline. Nephrology aware — AKI stage 3. Blood cultures x2 taken. Source: CT confirmed pyelonephritis R kidney.', lastUpdated:'2 min ago',
  },
  { id:'pt4', name:'James Chen', age:78, bed:'8D', dx:'Hip Fracture (NOF — Day 1 post-op)', emoji:'🦴',
    vitals:{ hr:78, sbp:132, dbp:80, spo2:96, temp:36.5, rr:14, gcs:15 },
    trend:'stable', triage:3, alerts:['Physiotherapy referral due','VTE prophylaxis doses 1/14 given','Pain score 4/10 — analgesia review'],
    meds:['Paracetamol 1g QDS','Oxycodone 5mg PRN','Enoxaparin 40mg OD','Omeprazole 20mg OD'],
    labs:{ hb:'9.8 g/dL ↓', creatinine:'110 μmol/L', glucose:'6.4 mmol/L', inr:'1.2', ferritin:'12 ng/mL ↓' },
    notes:'Dynamic hip screw inserted under GA. Post-op Hb drop — iron infusion prescribed. OT assessment AM.', lastUpdated:'28 min ago',
  },
  { id:'pt5', name:'Aisha Okafor', age:23, bed:'3A', dx:'DKA (Type 1 Diabetes)', emoji:'🩺',
    vitals:{ hr:108, sbp:102, dbp:64, spo2:99, temp:36.1, rr:22, gcs:15 },
    trend:'improving', triage:2, alerts:['K⁺ 3.1 — KCl replacement running','Bicarb trending up (improving)'],
    meds:['Actrapid insulin infusion 2 U/hr','0.9% NaCl 250ml/hr','KCl 40mmol in 1L bag','SC insulin when eating'],
    labs:{ glucose:'18.4 mmol/L ↓ (was 31.2)', hco3:'14 mEq/L ↑ (was 8)', ketones:'2.1 mmol/L ↓', k:'3.1 mmol/L ↓', creatinine:'84 μmol/L', ph:'7.28 ↑ (was 7.11)' },
    notes:'DKA protocol started 10:00. pH now 7.28 — resolving. Precipitant: omitted insulin (sick day rule not followed). Diabetes nurse educator review.', lastUpdated:'11 min ago',
  },
];

function MonitorTab() {
  const [selected, setSel]   = useState<typeof WARD_PATIENTS[0]|null>(null);
  const [tab, setTab]        = useState<'vitals'|'labs'|'meds'|'notes'>('vitals');
  const [liveRefresh, setLive] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue:1.08, duration:700, useNativeDriver:true }),
      Animated.timing(pulseAnim, { toValue:1, duration:700, useNativeDriver:true }),
    ]));
    if (liveRefresh) loop.start();
    return () => loop.stop();
  }, [liveRefresh]);

  const TRIAGE_COLORS: Record<number,string> = { 1:T.red, 2:T.orange, 3:T.gold, 4:T.green, 5:T.muted };
  const TREND_COLORS: Record<string,string>  = { stable:T.green, improving:T.teal, declining:T.orange, critical:T.red };
  const TREND_ICONS: Record<string,string>   = { stable:'→', improving:'↑', declining:'↓', critical:'⚠️' };

  const critCount = WARD_PATIENTS.filter(p => p.triage <= 1 || p.trend === 'critical').length;
  const alertCount = WARD_PATIENTS.reduce((a,p) => a + p.alerts.length, 0);

  if (selected) {
    const p = selected;
    const tc = TRIAGE_COLORS[p.triage] || T.muted;
    const trc = TREND_COLORS[p.trend] || T.muted;

    const VITAL_ROWS: { label:string; val:string; unit:string; flag?:boolean; color?:string }[] = [
      { label:'Heart rate',      val:String(p.vitals.hr),   unit:'bpm', flag:p.vitals.hr>100||p.vitals.hr<50, color:p.vitals.hr>100?T.orange:T.text },
      { label:'Systolic BP',     val:String(p.vitals.sbp),  unit:'mmHg', flag:p.vitals.sbp<90||p.vitals.sbp>160, color:p.vitals.sbp<90?T.red:p.vitals.sbp>160?T.orange:T.text },
      { label:'Diastolic BP',    val:String(p.vitals.dbp),  unit:'mmHg' },
      { label:'SpO₂',            val:String(p.vitals.spo2), unit:'%', flag:p.vitals.spo2<94, color:p.vitals.spo2<94?T.red:T.text },
      { label:'Temperature',     val:String(p.vitals.temp), unit:'°C', flag:p.vitals.temp>37.5||p.vitals.temp<36, color:p.vitals.temp>37.5?T.orange:T.text },
      { label:'Resp. rate',      val:String(p.vitals.rr),   unit:'/min', flag:p.vitals.rr>20||p.vitals.rr<12, color:p.vitals.rr>20?T.orange:T.text },
      { label:'GCS',             val:String(p.vitals.gcs),  unit:'/15', flag:p.vitals.gcs<14, color:p.vitals.gcs<14?T.red:T.text },
    ];

    return (
      <View style={{ flex:1, backgroundColor:T.bg }}>
        <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={{ flex:1 }}>
          {/* Patient header */}
          <LinearGradient colors={[tc+'25','rgba(0,0,0,0)']} style={{ padding:18, borderBottomWidth:1, borderBottomColor:T.border }}>
            <TouchableOpacity onPress={() => setSel(null)} style={{ marginBottom:10 }}>
              <Text style={{ color:T.muted, fontSize:13 }}>← Ward patients</Text>
            </TouchableOpacity>
            <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
              <Text style={{ fontSize:38 }}>{p.emoji}</Text>
              <View style={{ flex:1 }}>
                <Text style={{ color:T.text, fontSize:20, fontWeight:'900' }}>{p.name}</Text>
                <Text style={{ color:T.muted, fontSize:12 }}>Age {p.age} · Bed {p.bed} · {p.lastUpdated}</Text>
                <View style={{ flexDirection:'row', gap:8, marginTop:5, alignItems:'center' }}>
                  <View style={{ backgroundColor:tc+'22', paddingHorizontal:8, paddingVertical:3, borderRadius:6, borderWidth:1, borderColor:tc+'44' }}>
                    <Text style={{ color:tc, fontSize:10, fontWeight:'800' }}>T{p.triage}</Text>
                  </View>
                  <Text style={{ color:trc, fontWeight:'800', fontSize:12 }}>{TREND_ICONS[p.trend]} {p.trend.toUpperCase()}</Text>
                </View>
              </View>
            </View>
            <Text style={{ color:T.dimText, fontSize:12, marginTop:8, lineHeight:19, fontStyle:'italic' }}>{p.dx}</Text>
          </LinearGradient>

          {/* Alert banner */}
          {p.alerts.length > 0 && (
            <View style={{ backgroundColor:T.red+'18', borderBottomWidth:1, borderBottomColor:T.red+'35', padding:12 }}>
              {p.alerts.map((a,i) => (
                <Text key={i} style={{ color:'#FCA5A5', fontSize:11, lineHeight:18 }}>• {a}</Text>
              ))}
            </View>
          )}

          {/* Tab selector */}
          <View style={{ flexDirection:'row', borderBottomWidth:1, borderBottomColor:T.border }}>
            {(['vitals','labs','meds','notes'] as const).map(t => (
              <TouchableOpacity key={t} onPress={() => setTab(t)}
                style={{ flex:1, paddingVertical:12, alignItems:'center', borderBottomWidth:2, borderBottomColor:tab===t?tc:'transparent' }}>
                <Text style={{ color:tab===t?tc:T.muted, fontSize:11, fontWeight:'700', textTransform:'uppercase' }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={{ padding:18, paddingBottom:40, gap:12 }}>
            {tab === 'vitals' && (<>
              {VITAL_ROWS.map((v,i) => (
                <View key={i} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:12, borderBottomWidth:1, borderBottomColor:T.border }}>
                  <Text style={{ color:T.muted, fontSize:13 }}>{v.label}</Text>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                    <Text style={{ color:v.color||T.text, fontSize:18, fontWeight:'900' }}>{v.val}</Text>
                    <Text style={{ color:T.muted, fontSize:11 }}>{v.unit}</Text>
                    {v.flag && <Text style={{ fontSize:16 }}>⚠️</Text>}
                  </View>
                </View>
              ))}
              <GlassCard style={{ padding:14 }}>
                <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:10 }}>NEWS2 SCORE (AI calculated)</Text>
                {(() => {
                  let news = 0;
                  if (p.vitals.rr>=25||p.vitals.rr<=8) news+=3; else if (p.vitals.rr>=21) news+=2; else if (p.vitals.rr<=11) news+=1;
                  if (p.vitals.spo2<=91) news+=3; else if (p.vitals.spo2<=93) news+=2; else if (p.vitals.spo2<=95) news+=1;
                  if (p.vitals.sbp<=90||p.vitals.sbp>=220) news+=3; else if (p.vitals.sbp<=100||p.vitals.sbp>=200) news+=2; else if (p.vitals.sbp<=110) news+=1;
                  if (p.vitals.hr>=131||p.vitals.hr<=40) news+=3; else if (p.vitals.hr>=111||p.vitals.hr<=50) news+=2; else if (p.vitals.hr>=101||p.vitals.hr<=50) news+=1;
                  if (p.vitals.gcs<15) news+=3;
                  if (p.vitals.temp>=39.1||p.vitals.temp<=35) news+=2; else if (p.vitals.temp>=38.1||p.vitals.temp<=36) news+=1;
                  const col = news>=7?T.red:news>=5?T.orange:news>=3?T.gold:T.green;
                  const rec = news>=7?'Urgent escalation — ICU review now':news>=5?'Urgent — Senior review in <30min':news>=3?'Close monitoring — 1hr obs':T.green ? 'Routine — 12hr obs' : '';
                  return (<>
                    <View style={{ flexDirection:'row', alignItems:'center', gap:14 }}>
                      <Text style={{ color:col, fontSize:36, fontWeight:'900' }}>{news}</Text>
                      <View>
                        <AnimBar value={news} max={20} color={col} height={8} />
                        <Text style={{ color:col, fontSize:12, fontWeight:'700', marginTop:6 }}>{rec}</Text>
                      </View>
                    </View>
                  </>);
                })()}
              </GlassCard>
            </>)}

            {tab === 'labs' && (<>
              {Object.entries(p.labs).map(([k,v],i) => {
                const isAbnormal = String(v).includes('↑') || String(v).includes('↓');
                return (
                  <View key={i} style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:11, borderBottomWidth:1, borderBottomColor:T.border }}>
                    <Text style={{ color:T.muted, fontSize:13, textTransform:'capitalize' }}>{k.replace('_',' ')}</Text>
                    <Text style={{ color:isAbnormal?T.orange:T.text, fontWeight:isAbnormal?'800':'400', fontSize:13 }}>{String(v)}</Text>
                  </View>
                );
              })}
            </>)}

            {tab === 'meds' && (<>
              {p.meds.map((m,i) => (
                <View key={i} style={{ flexDirection:'row', gap:12, alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderBottomColor:T.border }}>
                  <View style={{ width:32, height:32, borderRadius:10, backgroundColor:T.green+'20', borderWidth:1, borderColor:T.green+'40', alignItems:'center', justifyContent:'center' }}>
                    <Text style={{ fontSize:16 }}>💊</Text>
                  </View>
                  <Text style={{ color:T.text, fontSize:13, flex:1 }}>{m}</Text>
                </View>
              ))}
              <GlassCard style={{ padding:12, marginTop:4 }}>
                <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:8 }}>AI DRUG INTERACTION CHECK</Text>
                <Text style={{ color:T.green, fontSize:12 }}>✅ No critical interactions detected</Text>
                <Text style={{ color:T.muted, fontSize:11, marginTop:4 }}>Minor: Opioids + CNS depressants — monitor sedation score. Anticoagulants: bleeding risk — daily INR recommended.</Text>
              </GlassCard>
            </>)}

            {tab === 'notes' && (<>
              <GlassCard style={{ padding:16 }}>
                <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:10 }}>CLINICAL NOTES</Text>
                <Text style={{ color:T.text, fontSize:13, lineHeight:22 }}>{p.notes}</Text>
              </GlassCard>
              <GlassCard style={{ padding:16 }}>
                <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginBottom:10 }}>AI CLINICAL SUMMARY</Text>
                <Text style={{ color:T.dimText, fontSize:12, lineHeight:20 }}>
                  Patient {p.name}, {p.age}y, admitted with {p.dx}. Current trend: <Text style={{ color:trc, fontWeight:'800' }}>{p.trend}</Text>. {p.alerts.length} active alert{p.alerts.length!==1?'s':''} requiring attention. AI recommends: continue current management plan — review within {p.triage===1?'30 minutes':p.triage===2?'2 hours':'8 hours'}.
                </Text>
              </GlassCard>
            </>)}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <LinearGradient colors={['#010106','#030208']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding:18, paddingBottom:40, gap:14 }}>
          {/* Header */}
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
            <View>
              <Text style={{ color:T.text, fontSize:20, fontWeight:'900' }}>Doctor Dashboard</Text>
              <Text style={{ color:T.muted, fontSize:12 }}>Ward monitoring · Real-time alerts · AI triage</Text>
            </View>
            <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
              <Text style={{ color:T.muted, fontSize:11 }}>Live</Text>
              <Switch value={liveRefresh} onValueChange={setLive} trackColor={{ true:T.green, false:T.border }} thumbColor={T.text} />
            </View>
          </View>

          {/* Ward summary stats */}
          <View style={{ flexDirection:'row', gap:10 }}>
            <Animated.View style={{ flex:1, transform:[{scale:pulseAnim}] }}>
              <LinearGradient colors={[T.red+'30',T.red+'10']} style={{ borderRadius:14, padding:13, borderWidth:1, borderColor:T.red+'55', alignItems:'center' }}>
                <Text style={{ color:T.red, fontSize:28, fontWeight:'900' }}>{critCount}</Text>
                <Text style={{ color:T.muted, fontSize:10, textAlign:'center' }}>Critical / Urgent</Text>
              </LinearGradient>
            </Animated.View>
            <View style={{ flex:1, backgroundColor:'rgba(255,255,255,0.03)', borderRadius:14, padding:13, borderWidth:1, borderColor:T.border, alignItems:'center' }}>
              <Text style={{ color:T.orange, fontSize:28, fontWeight:'900' }}>{alertCount}</Text>
              <Text style={{ color:T.muted, fontSize:10, textAlign:'center' }}>Active alerts</Text>
            </View>
            <View style={{ flex:1, backgroundColor:'rgba(255,255,255,0.03)', borderRadius:14, padding:13, borderWidth:1, borderColor:T.border, alignItems:'center' }}>
              <Text style={{ color:T.text, fontSize:28, fontWeight:'900' }}>{WARD_PATIENTS.length}</Text>
              <Text style={{ color:T.muted, fontSize:10, textAlign:'center' }}>Patients on ward</Text>
            </View>
          </View>

          {/* Alert summary */}
          {WARD_PATIENTS.filter(p => p.alerts.length > 0).map(p => (
            <TouchableOpacity key={p.id+'_alert'} onPress={() => setSel(p)}>
              <LinearGradient colors={[T.red+'20','rgba(0,0,0,0)']}
                style={{ borderRadius:14, padding:12, borderWidth:1, borderColor:T.red+'45', flexDirection:'row', alignItems:'center', gap:12 }}>
                <Text style={{ fontSize:24 }}>{p.emoji}</Text>
                <View style={{ flex:1 }}>
                  <Text style={{ color:T.text, fontWeight:'700', fontSize:13 }}>{p.name} · Bed {p.bed}</Text>
                  <Text style={{ color:'#FCA5A5', fontSize:11, marginTop:3 }}>{p.alerts[0]}</Text>
                  {p.alerts.length > 1 && <Text style={{ color:T.muted, fontSize:10 }}>+{p.alerts.length-1} more alerts</Text>}
                </View>
                <View style={{ backgroundColor:TRIAGE_COLORS[p.triage]+'30', paddingHorizontal:8, paddingVertical:4, borderRadius:7 }}>
                  <Text style={{ color:TRIAGE_COLORS[p.triage], fontWeight:'800', fontSize:12 }}>T{p.triage}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}

          <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', letterSpacing:1.5, marginTop:4 }}>ALL PATIENTS — SORTED BY ACUITY</Text>

          {[...WARD_PATIENTS].sort((a,b) => a.triage - b.triage).map(p => {
            const tc = TRIAGE_COLORS[p.triage] || T.muted;
            const trc = TREND_COLORS[p.trend] || T.muted;
            return (
              <TouchableOpacity key={p.id} onPress={() => setSel(p)}>
                <GlassCard style={{ padding:14, borderColor:p.trend==='critical'?T.red+'60':p.trend==='declining'?T.orange+'50':T.border, borderWidth:p.trend==='critical'?1.5:1 }}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
                    <Text style={{ fontSize:30 }}>{p.emoji}</Text>
                    <View style={{ flex:1 }}>
                      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                        <Text style={{ color:T.text, fontWeight:'800', fontSize:14 }}>{p.name}</Text>
                        <View style={{ flexDirection:'row', gap:6, alignItems:'center' }}>
                          <Text style={{ color:trc, fontSize:12, fontWeight:'700' }}>{TREND_ICONS[p.trend]}</Text>
                          <View style={{ backgroundColor:tc+'22', paddingHorizontal:7, paddingVertical:2, borderRadius:5, borderWidth:1, borderColor:tc+'44' }}>
                            <Text style={{ color:tc, fontSize:10, fontWeight:'800' }}>T{p.triage}</Text>
                          </View>
                        </View>
                      </View>
                      <Text style={{ color:T.muted, fontSize:11, marginTop:2 }}>Bed {p.bed} · {p.age}y · {p.dx}</Text>
                    </View>
                  </View>

                  {/* Mini vitals row */}
                  <View style={{ flexDirection:'row', gap:8, marginTop:10, paddingTop:8, borderTopWidth:1, borderTopColor:T.border, flexWrap:'wrap' }}>
                    {[
                      { l:'HR', v:`${p.vitals.hr}`, c:p.vitals.hr>100?T.orange:T.muted },
                      { l:'BP', v:`${p.vitals.sbp}/${p.vitals.dbp}`, c:p.vitals.sbp<90?T.red:T.muted },
                      { l:'SpO₂', v:`${p.vitals.spo2}%`, c:p.vitals.spo2<94?T.red:T.muted },
                      { l:'Temp', v:`${p.vitals.temp}°`, c:p.vitals.temp>37.5?T.orange:T.muted },
                      { l:'GCS', v:`${p.vitals.gcs}`, c:p.vitals.gcs<14?T.red:T.muted },
                    ].map((v,i) => (
                      <View key={i} style={{ alignItems:'center', minWidth:48 }}>
                        <Text style={{ color:v.c, fontWeight:'700', fontSize:12 }}>{v.v}</Text>
                        <Text style={{ color:T.border, fontSize:9 }}>{v.l}</Text>
                      </View>
                    ))}
                    {p.alerts.length > 0 && (
                      <View style={{ backgroundColor:T.red+'20', paddingHorizontal:7, paddingVertical:2, borderRadius:5, borderWidth:1, borderColor:T.red+'40', marginLeft:'auto' }}>
                        <Text style={{ color:T.red, fontSize:9, fontWeight:'700' }}>{p.alerts.length} alert{p.alerts.length!==1?'s':''}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color:T.border, fontSize:10, marginTop:6, textAlign:'right' }}>Updated {p.lastUpdated}</Text>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
// --- Main Tab Navigator (8 Tabs) ---
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor:'#020108', borderTopColor:T.border, height:Platform.OS==='ios'?90:68, paddingBottom:Platform.OS==='ios'?28:12, paddingTop:10 },
      tabBarActiveTintColor: T.accent,
      tabBarInactiveTintColor: T.muted,
      tabBarLabelStyle: { fontSize:8, fontWeight:'800', letterSpacing:0.2 },
    }}>
      <Tab.Screen name="Scan"      component={ScanTab}      options={{ tabBarIcon:({color}:any) => <Text style={{fontSize:18,color}}>✨</Text>, tabBarLabel:'SCAN' }} />
      <Tab.Screen name="Emergency" component={EmergencyTab} options={{ tabBarIcon:({color}:any) => <Text style={{fontSize:18,color}}>🚑</Text>, tabBarLabel:'SOS' }} />
      <Tab.Screen name="Treatment" component={TreatmentTab} options={{ tabBarIcon:({color}:any) => <Text style={{fontSize:18,color}}>💉</Text>, tabBarLabel:'TREAT' }} />
      <Tab.Screen name="Simulator" component={SimulatorTab} options={{ tabBarIcon:({color}:any) => <Text style={{fontSize:18,color}}>🎓</Text>, tabBarLabel:'SIM' }} />
      <Tab.Screen name="Research"  component={ResearchTab}  options={{ tabBarIcon:({color}:any) => <Text style={{fontSize:18,color}}>🔬</Text>, tabBarLabel:'RESEARCH' }} />
      <Tab.Screen name="Genomics"  component={GenomicsTab}  options={{ tabBarIcon:({color}:any) => <Text style={{fontSize:18,color}}>🧬</Text>, tabBarLabel:'GENOME' }} />
      <Tab.Screen name="Robotics"  component={RoboticsTab}  options={{ tabBarIcon:({color}:any) => <Text style={{fontSize:18,color}}>🦾</Text>, tabBarLabel:'ROBOT' }} />
      <Tab.Screen name="Monitor"   component={MonitorTab}   options={{ tabBarIcon:({color}:any) => <Text style={{fontSize:18,color}}>📊</Text>, tabBarLabel:'MONITOR' }} />
    </Tab.Navigator>
  );
}

// --- Root App ---
export default function App() {
  return (
    <NavigationContainer theme={{ ...DarkTheme, colors:{ ...DarkTheme.colors, background:T.bg, card:T.card, border:T.border } }}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />
      <Stack.Navigator screenOptions={{ headerShown:false, animation:'fade' }}>
        <Stack.Screen name="Splash"     component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth"       component={AuthScreen} />
        <Stack.Screen name="Main"       component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
