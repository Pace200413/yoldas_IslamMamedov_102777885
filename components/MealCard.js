// src/components/MealCard.js
import React from 'react';
import { Pressable, View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function MealCard({ item, styles, navigation, openOptions, openDiscount, toggleStock, handleDelete }) {
  return (
    <Pressable
      onPress={() => navigation.navigate('EditItemModal', { ...item })}
      android_ripple={{ color: '#f1f5f9' }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Image
        source={item.photo ? { uri: item.photo } : require('../assets/icons/la-casa-logo.jpg')}
        style={styles.cardImg}
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.name}</Text>

        {item.discount > 0 ? (
          <View style={styles.priceRow}>
            <Text style={styles.priceStrikethrough}>TMT {item.price?.toFixed(2)}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>
                TMT {(item.price * (1 - item.discount / 100)).toFixed(2)}
              </Text>
            </View>
            <Text style={styles.discountTxt}>-{item.discount}%</Text>
          </View>
        ) : (
          <Text style={styles.cardPrice}>TMT {item.price?.toFixed(2)}</Text>
        )}

        {item.outOfStock ? <Text style={styles.oos}>Out of stock</Text> : null}

        {/* quick actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionChip, styles.chipMint]} onPress={() => openOptions(item)}>
            <Feather name="settings" size={14} color="#047857" />
            <Text style={[styles.actionTxt, styles.chipMintTxt]}>Options</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionChip, styles.chipAmber]} onPress={() => openDiscount(item)}>
            <Feather name="percent" size={14} color="#92400e" />
            <Text style={[styles.actionTxt, styles.chipAmberTxt]}>Discount</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionChip, styles.chipSlate]} onPress={() => toggleStock(item)}>
            <Feather name={item.outOfStock ? 'toggle-left' : 'toggle-right'} size={16} color="#334155" />
            <Text style={[styles.actionTxt, styles.chipSlateTxt]}>
              {item.outOfStock ? 'Mark In' : 'Mark Out'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.cardAction}>
        <Feather name="trash" size={20} color="#ef4444" />
      </TouchableOpacity>
    </Pressable>
  );
}
