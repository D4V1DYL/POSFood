import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, FlatList, StyleSheet, Modal } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const menuItems = [
    { itemId: 'A1', name: 'Iced Coffee', category: 'Beverage' },
    { itemId: 'A2', name: 'Fruit Smoothie', category: 'Beverage' },
    { itemId: 'B1', name: 'Croissant', category: 'Food' },
    { itemId: 'B2', name: 'Salad', category: 'Food' },
    { itemId: 'C1', name: 'Water', category: 'Beverage' },
    { itemId: 'D1', name: 'Cake', category: 'Others' },
  ];
  
const menuItemsWithId = menuItems.map((item, index) => ({
    ...item,
    id: index + 1,
  }));

interface MenuItem {
  id: number;
  itemId: string; 
  name: string;
  category: string;
}

export default function Menu() {
  const [tableNumber, setTableNumber] = useState<string>('');
  const [isTableEntered, setIsTableEntered] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cartItems, setCartItems] = useState<{ item: MenuItem; quantity: number; keterangan: string }[]>([]);
  const [isCartPromptVisible, setIsCartPromptVisible] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [keterangan, setKeterangan] = useState<string>('');
  const [cartItemsMenu, setCartItemsMenu] = useState([]);



  const addItemToCart = (item: MenuItem) => {
    setCurrentItem(item);
    setIsModalVisible(true);
  };

  const handleAddItem = () => {
    if (currentItem) {
      // Check if the item already exists in the cart with the same note
      const existingItem = cartItems.find(cartItem =>
        cartItem.item.itemId === currentItem.itemId && cartItem.keterangan === keterangan
      );
  
      // If the item with the same note exists, update quantity
      if (existingItem) {
        setCartItems(cartItems.map(cartItem =>
          cartItem.item.itemId === currentItem.itemId && cartItem.keterangan === keterangan
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ));
      } else {
        // If the item with the note doesn't exist, add a new item to the cart
        setCartItems([
          ...cartItems,
          { item: currentItem, keterangan: keterangan ?? '', quantity: 1 }
        ]);
      }
  
      // Show cart prompt and reset the modal
      setIsCartPromptVisible(true);
      setIsModalVisible(false);
      setKeterangan('');
    }
  };
  

  const removeItemFromCart = (item: MenuItem) => {
    const existingItem = cartItems.find(cartItem => cartItem.item.itemId === item.itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.item.itemId === item.itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCartItems(cartItems.filter(cartItem => cartItem.item.itemId !== item.itemId));
    }
  };

  const totalQuantity = cartItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

  const filteredMenuItems = menuItemsWithId.filter(item =>
    (selectedCategory === 'All' || item.category === selectedCategory) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isTableEntered) {
    return (
      <View style={[styles.container, styles.centeredContainer]}>
        <Text style={styles.title}>Enter Table Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter table number"
          keyboardType="numeric"
          value={tableNumber}
          onChangeText={setTableNumber}
        />
        <Button title="Confirm" onPress={() => setIsTableEntered(true)} color="#7B68EE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Make Your Selection!</Text>
      </View>

      {isTableEntered && (
        <View style={styles.tableInfo}>
          <Text style={styles.tableText}>You’re at table {tableNumber}</Text>
          <Button title="Change Table" onPress={() => setIsTableEntered(false)} color="#7B68EE" />
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Search menu..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <View style={styles.categoryContainer}>
        {['All', 'Food 🍽️', 'Beverage 🥤', 'Others 🎉'].map(category => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category.split(' ')[0])}
            style={[
              styles.categoryButton,
              selectedCategory === category.split(' ')[0] && styles.selectedCategoryButton,
            ]}
          >
            <Text style={styles.categoryButtonText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredMenuItems}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.menuItem}>
            <Text style={styles.menuName}>{item.name}</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={() => removeItemFromCart(item)}>
                <Ionicons name="remove-circle-outline" size={24} color="#4C3A8C" />              
                </TouchableOpacity>
              <Text style={styles.quantityText}>
                {cartItems.find(cartItem => cartItem.item.id === item.id)?.quantity || 0}
              </Text>
              <TouchableOpacity onPress={() => addItemToCart(item)}>
                <Ionicons name="add-circle-outline" size={24} color="#4C3A8C" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.bottomBar}>
        <Text style={styles.cartText}>Total Items: {totalQuantity}</Text>
        <Link
          href={{
            pathname: '/SummaryOrder',
            params: { 
                cartItems: JSON.stringify(cartItems),
                tableNumber: tableNumber || '00'
            }
          }}
          asChild
        >
          <Button title="Continue" color="#7B68EE" />
        </Link>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter Notes"
              value={keterangan}
              onChangeText={setKeterangan}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setIsModalVisible(false)} color="#FF6347" />
              <Button title="Add" onPress={handleAddItem} color="#7B68EE" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EFFF',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5D9F2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
    width: '100%',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A594F9',
    marginTop: 26,
  },
  tableInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#E5D9F2',
    borderRadius: 8,
  },
  tableText: {
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A594F9',
    marginVertical: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  categoryButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#CDC1FF',
  },
  selectedCategoryButton: {
    backgroundColor: '#A594F9',
  },
  categoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  menuName: {
    fontSize: 16,
    color: '#A594F9',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#CDC1FF',
    borderRadius: 4,
    padding: 8,
  },
  quantityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 16,
  },
  bottomBar: {
    backgroundColor: '#A594F9',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cartText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 5,
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5D9F2',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});