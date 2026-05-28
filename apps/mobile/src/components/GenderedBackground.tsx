/**
 * GenderedBackground
 *
 * Wraps a screen with the Watercolor Nursery background (light mode) or
 * the Moonlit Jewel jewel-tone canvas (dark mode).
 *
 * Light mode:
 *   - boy  → sky blue wash (#DDEDF6 → #F4FAFD)
 *   - girl → blush rose (#F8DCD6 → #FCEFEC)
 *   - twins (boy+girl) → diagonal gradient between both
 *
 * Dark mode: jewel-tone canvas regardless of child sex.
 *
 * Uses expo-linear-gradient (already in deps). Radial glow accents are
 * approximated with layered semi-transparent Views since RN/expo-linear-gradient
 * only supports linear gradients.
 */

import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePrototypeState } from '../state/PrototypeState';
import { useAppTheme } from '../theme/useAppTheme';
import { genderedBg, jewelDark } from '../theme';

export function GenderedBackground({ children }: PropsWithChildren) {
  const theme = useAppTheme();
  const { family, activeChild } = usePrototypeState();

  if (theme.isDark) {
    // Moonlit Jewel canvas
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[jewelDark.bgFrom, jewelDark.bgMid, jewelDark.bgTo]}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Plum glow — top-left */}
        <View style={[styles.glowTopLeft, { backgroundColor: 'rgba(157, 90, 229, 0.3)' }]} />
        {/* Teal glow — top-right */}
        <View style={[styles.glowTopRight, { backgroundColor: 'rgba(60, 180, 170, 0.2)' }]} />
        {/* Rose glow — bottom */}
        <View style={[styles.glowBottom, { backgroundColor: 'rgba(244, 108, 143, 0.13)' }]} />
        {children}
      </View>
    );
  }

  // Light mode — determine gender
  const isTwins = family.mode === 'twins';
  const twinType = family.twinType;
  const isBoyGirlTwins = isTwins && twinType === 'boy_girl';
  const isBoyBoy = isTwins && twinType === 'boy_boy';
  const isGirlGirl = isTwins && twinType === 'girl_girl';
  const isBoy = (!isTwins && activeChild.sex === 'boy') || isBoyBoy;

  // isGirl covers: single girl, girl_girl twins, and also is the default
  const isGirl = (!isTwins && activeChild.sex === 'girl') || isGirlGirl;
  void isGirl; // used implicitly — palette selection below covers remaining case

  if (isBoyGirlTwins) {
    // Diagonal gradient: boy blue → girl rose
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[genderedBg.boy.bgFrom, '#F0EAEC', genderedBg.girl.bgFrom]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Blue header wash on top-left */}
        <View style={[styles.headerWashLeft, { backgroundColor: 'rgba(173, 206, 229, 0.55)' }]} />
        {/* Rose header wash on top-right */}
        <View style={[styles.headerWashRight, { backgroundColor: 'rgba(237, 183, 174, 0.55)' }]} />
        {children}
      </View>
    );
  }

  const palette = isBoy ? genderedBg.boy : genderedBg.girl;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[palette.bgFrom, palette.bgTo]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Header radial wash — approximated with a rounded view at the top */}
      <View
        style={[
          styles.headerRadial,
          { backgroundColor: palette.headerFrom, opacity: 0.55 },
        ]}
      />
      {/* Softer mid layer */}
      <View
        style={[
          styles.headerMid,
          { backgroundColor: palette.headerMid, opacity: 0.35 },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
  },
  // Light mode header washes
  headerRadial: {
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    height: 240,
    left: -40,
    position: 'absolute',
    right: -40,
    top: -60,
  },
  headerMid: {
    borderBottomLeftRadius: 160,
    borderBottomRightRadius: 160,
    height: 180,
    left: -20,
    position: 'absolute',
    right: -20,
    top: -20,
  },
  // Twin diagonal header washes
  headerWashLeft: {
    borderBottomRightRadius: 240,
    height: 220,
    left: -40,
    position: 'absolute',
    right: '40%',
    top: -40,
  },
  headerWashRight: {
    borderBottomLeftRadius: 240,
    height: 220,
    left: '40%',
    position: 'absolute',
    right: -40,
    top: -40,
  },
  // Dark mode glow layers
  glowTopLeft: {
    borderRadius: 300,
    height: 400,
    left: -120,
    opacity: 0.65,
    position: 'absolute',
    top: -180,
    width: 400,
  },
  glowTopRight: {
    borderRadius: 300,
    height: 380,
    opacity: 0.55,
    position: 'absolute',
    right: -100,
    top: 80,
    width: 380,
  },
  glowBottom: {
    borderRadius: 300,
    bottom: -100,
    height: 340,
    left: '10%',
    opacity: 0.55,
    position: 'absolute',
    width: 340,
  },
});
