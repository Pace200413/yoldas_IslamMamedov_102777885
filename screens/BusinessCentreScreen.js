// screens/BusinessCentreScreen.js
import React from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BusinessCentreScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();        // safe-area height

  return (
    <SafeAreaView style={styles.flex}>
      {/* ───── Back Arrow ───── */}
      <TouchableOpacity
        onPress={() =>
          navigation.canGoBack()
            ? navigation.goBack()
            : navigation.navigate('AccountHub', { screen: 'BusinessCentre' })
        }
        style={[styles.backBtn, { top: insets.top + 8 }]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={28} color="#111" />
      </TouchableOpacity>

      {/* ───── Content ───── */}
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 56 },  // 56 = arrow (28) + gap (28)
        ]}
      >
        <Image
          source={require('../assets/icons/business-hero.png')}
          style={styles.hero}
          resizeMode="cover"
        />
        <Text style={styles.h1}>Work with us!</Text>
        <Text style={styles.text}>
          Join our platform as a restaurant partner and reach thousands of customers.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() =>
            navigation.navigate('OwnerOnboarding', { screen: 'OwnerRegistration' })
          }
        >
          <Text style={styles.primaryTxt}>Register as a Restaurant Owner</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={styles.secondaryTxt}>Learn More</Text>
        </TouchableOpacity>

        {/* bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ───── styles ───── */
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },

  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 20,
    padding: 6,
  },

  container: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },

  hero: { width: '100%', height: 190, borderRadius: 14, marginBottom: 28 },
  h1:   { fontSize: 24, fontWeight: '700', marginBottom: 12, alignSelf: 'flex-start' },
  text: { fontSize: 16, color: '#444', marginBottom: 32, lineHeight: 22 },

  primaryBtn: {
    backgroundColor: '#10b981', paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 20,
  },
  primaryTxt: { color: '#fff', fontWeight: '600', fontSize: 15 },

  secondaryBtn: { padding: 12, marginBottom: 24 },
  secondaryTxt: { color: '#06b6d4', fontWeight: '600' },
});
