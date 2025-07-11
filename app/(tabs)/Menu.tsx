import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, FlatList, StyleSheet, Modal, Image, Alert } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MenuItem {
  id: number;
  code: string;
  fullname: string;
  category: string;
  categoryType: string;
}

export default function Menu() {
  const [tableNumber, setTableNumber] = useState<string>('0');
  const [isTableEntered, setIsTableEntered] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cartItems, setCartItems] = useState<{ item: MenuItem; quantity: number; keterangan: string }[]>([]);
  const [isCartPromptVisible, setIsCartPromptVisible] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [keterangan, setKeterangan] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [serverIP, setServerIP] = useState<string>('');
  const [waiterCode, setWaiterCode] = useState<string | null>(null);
  const [permissionMenu, setPermissionMenu] = useState<boolean | null>(null);
  const [uuidValue, setUuidValue] = useState<string>('');


  const stage: string = 'production'; // 'dev' or 'Production'

  const categorizeItem = (code: string): string => {
    if (code.startsWith('1')) {
      return 'Food';
    } else if (code.startsWith('2')) {
      return 'Beverage';
    } else {
      return 'Others';
    }
  };

  const fetchPermission = useCallback(async () => {
    try {
      const response = await axios.post(`http://${serverIP}/activation/${uuidValue}`);
      if (response.data === "Activation Success") {
        await AsyncStorage.setItem('permissionMenu', JSON.stringify(true));
        setPermissionMenu(true);
        Alert.alert('Success', 'Your account has been activated. You can now access the menu.');
      } else {
        setPermissionMenu(false);
        Alert.alert('Error', `${response.data}. Please try again.`);
        console.error('Error', response.data , 'Please try again.');
      }
    } catch (error) {
      console.error('Error fetching permission:', error);
      setPermissionMenu(false);
    }
  }, [serverIP, uuidValue]);

  const fetchServerIpAndMenuItems = async () => {
    try {
      // Fetch the server IP from AsyncStorage
      const getBEIP = await AsyncStorage.getItem('serverBEIP');
      if(!getBEIP) {
        Alert.alert('Error', 'Server IP is not set. Please configure it.');
      }
      const storedServerIP = `http://${getBEIP}/menu/list/all`;
      setServerIP(storedServerIP);

      // Determine the correct API URL
      const API_URL = stage === 'dev' ? 'https://itdgyec.localto.net/menu/list/all' : storedServerIP;
      // Alert.alert('API URL', API_URL);

      // Fetch the menu items
      const response = await axios.get(API_URL);
      const fetchedMenuItems = response.data.map((item: any) => ({
        id: item.id,
        code: item.code,
        fullname: item.fullName,
        category: categorizeItem(item.code),
        categoryType: item.quantityType,
      }));
      setMenuItems(fetchedMenuItems);

      // Save menu items to AsyncStorage
      await AsyncStorage.setItem('menuItems', JSON.stringify(fetchedMenuItems));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Failed to fetch menu items', error.message);
      } else {
        Alert.alert('Failed to fetch menu items', 'An unknown error occurred' +' '+ serverIP);
      }
    }
  };
  
  
  useFocusEffect(
    useCallback(() => {
      const fetchStoredData = async () => {
        try {
          const storedServerIP = await AsyncStorage.getItem('serverBEIP');
          const storedWaiterCode = await AsyncStorage.getItem('waiterCode');
          const storedUuidValue = await AsyncStorage.getItem('uuid');
          const storedPermissionMenu = await AsyncStorage.getItem('permissionMenu');
          const storedMenuItems = await AsyncStorage.getItem('menuItems');
  
          setWaiterCode(storedWaiterCode || '');
          setServerIP(storedServerIP || '');
          setUuidValue(storedUuidValue || '');
          setMenuItems(storedMenuItems ? JSON.parse(storedMenuItems) : []);
          setPermissionMenu(storedPermissionMenu ? JSON.parse(storedPermissionMenu) : false);

          if (!storedMenuItems || JSON.parse(storedMenuItems).length === 0) {
            fetchServerIpAndMenuItems();
          }

        } catch (error) {
          console.error('Error fetching stored data:', error);
        }
      };
  
      fetchStoredData();
  
    }, [])
  );


  // useEffect(() => {
  //   const fetchServerIpAndMenuItems = async () => {
  //     try {
  //       // Fetch the server IP from AsyncStorage
  //       const getBEIP = await AsyncStorage.getItem('serverBEIP');
  //       if(!getBEIP) {
  //         Alert.alert('Error', 'Server IP is not set. Please configure it.');
  //       }
  //       const storedServerIP = `http://${getBEIP}/menu/list/all`;
  //       setServerIP(storedServerIP);

  //       // Determine the correct API URL
  //       const API_URL = stage === 'dev' ? 'https://itdgyec.localto.net/menu/list/all' : storedServerIP;
  //       // Alert.alert('API URL', API_URL);

  //       // Fetch the menu items
  //       const response = await axios.get(API_URL);
  //       const fetchedMenuItems = response.data.map((item: any) => ({
  //         id: item.id,
  //         code: item.code,
  //         fullname: item.fullName,
  //         category: categorizeItem(item.code),
  //         categoryType: item.quantityType,
  //       }));
  //       setMenuItems(fetchedMenuItems);

  //       // Save menu items to AsyncStorage
  //       await AsyncStorage.setItem('menuItems', JSON.stringify(fetchedMenuItems));
  //     } catch (error) {
  //       if (axios.isAxiosError(error)) {
  //         Alert.alert('Failed to fetch menu items', error.message);
  //       } else {
  //         Alert.alert('Failed to fetch menu items', 'An unknown error occurred' +' '+ serverIP);
  //       }
  //     }
  //   };

  //   fetchServerIpAndMenuItems();
  // }, []);

  const refreshMenu = async () => {
    try {
      const API_URL = stage === 'dev' ? 'https://itdgyec.localto.net/menu/list/all' : `http://${serverIP}/menu/list/all`;
      const response = await axios.get(API_URL);
      const fetchedMenuItems = response.data.map((item: any) => ({
        id: item.id,
        code: item.code,
        fullname: item.fullName,
        category: categorizeItem(item.code),
        categoryType: item.quantityType,
      }));
      setMenuItems(fetchedMenuItems);

      // Save menu items to AsyncStorage
      await AsyncStorage.setItem('menuItems', JSON.stringify(fetchedMenuItems));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Alert.alert('Failed to fetch menu items', error.message);
      } else {
        Alert.alert('Failed to fetch menu items', 'An unknown error occurred');
      }
    }
  };

  const clearOrder = () => {
    setCartItems([]);
  };

  const addItemToCart = (item: MenuItem) => {
    setCurrentItem(item);
    setIsModalVisible(true);
  };

  const handleAddItem = () => {
    if (currentItem) {
      const existingItem = cartItems.find(cartItem =>
        cartItem.item.code === currentItem.code && cartItem.keterangan === keterangan
      );

      if (existingItem) {
        setCartItems(cartItems.map(cartItem =>
          cartItem.item.code === currentItem.code && cartItem.keterangan === keterangan
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        ));
      } else {
        setCartItems([
          ...cartItems,
          { item: currentItem, keterangan: keterangan ?? '', quantity: quantity }
        ]);
      }

      setIsCartPromptVisible(true);
      setIsModalVisible(false);
      setKeterangan('');
      setQuantity(1);
    }
  };

  const removeItemFromCart = (item: MenuItem) => {
    const existingItem = cartItems.find(cartItem => cartItem.item.code === item.code);
    if (existingItem && existingItem.quantity > 1) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.item.code === item.code
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCartItems(cartItems.filter(cartItem => cartItem.item.code !== item.code));
    }
  };

  const totalQuantity = cartItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

  const totalQuantityPerItem = (itemId: string) => {
    let total = 0;
    cartItems.forEach(e => {
      if (e.item.code === itemId) {
        total = total + e.quantity;
      }
    });
    return total;
  };


  const filteredMenuItems = menuItems.filter(item =>
    (selectedCategory === 'All' || item.category === selectedCategory) &&
    item.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!permissionMenu) {
    return (
      <View style={styles.container}>
        <Text>Activate your account to access the menu.</Text>
        <Button title="Activate" onPress={fetchPermission} />
      </View>
    );
  }

  if (!waiterCode || !serverIP) {
    return (
      <View style={styles.lockedContainer}>
        <Text style={styles.lockedText}>Access Denied. Please set the Waiter Code and Server IP.</Text>
      </View>
    );
  }

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
        <View style={styles.buttonRow}>
          <Button title="Refresh Menu" onPress={refreshMenu} color="#7B68EE" />
          <View style={styles.buttonGap} />
          <Button title="Clear Order" onPress={clearOrder} color="#FF6347" />
        </View>
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
        {['All', 'Food', 'Beverage', 'Others'].map(category => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category.split(' ')[0])}
            style={[
              styles.categoryButton,
              selectedCategory === category.split(' ')[0] && styles.selectedCategoryButton,
            ]}
          >
            {category === 'Others' ? (
              <View style={styles.categoryContent}>
                <Text style={styles.categoryButtonText}>Others</Text>
                <Image
                  source={require('../../assets/images/other_menu-removebg-preview.png')} // Replace with your image path
                  style={styles.categoryImage}
                />
              </View>
            ) : category === 'Food' ? (
              <View style={styles.categoryContent}>
                <Text style={styles.categoryButtonText}>Food</Text>
                <Image
                  source={require('../../assets/images/food_orange-removebg-preview.png')} // Replace with your image path
                  style={styles.categoryImage}
                />
              </View>
            ) : category === 'Beverage' ? (
              <View style={styles.categoryContent}>
                <Text style={styles.categoryButtonText}>Beverage</Text>
                <Image
                  source={require('../../assets/images/drink_orange1-removebg-preview.png')} // Replace with your image path
                  style={styles.categoryImage}
                />
              </View>
            ) : (
              <Text style={styles.categoryButtonText}>{category}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredMenuItems}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.menuItem}>
            <Text style={styles.menuName}>{item.fullname.toUpperCase()}</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={() => removeItemFromCart(item)}>
                <Ionicons name="remove-circle-outline" size={30} color="#4C3A8C" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>
                {totalQuantityPerItem(item.code.toString())}
              </Text>
              <TouchableOpacity onPress={() => addItemToCart(item)}>
                <Ionicons name="add-circle-outline" size={30} color="#4C3A8C" />
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
          <Button title="Continue" color="#7B68EE" disabled={totalQuantity === 0} />
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
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                <Ionicons name="remove-circle-outline" size={30} color="#4C3A8C" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                <Ionicons name="add-circle-outline" size={30} color="#4C3A8C" />
              </TouchableOpacity>
            </View>
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
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  menuName: {
    fontSize: 16,
    color: '#563A9C',
    fontWeight: 'bold',
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
    fontSize: 18,
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
  categoryImage: {
    width: 30,
    height: 24,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertBox: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  alertButton: {
    backgroundColor: '#7B68EE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#7B68EE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EFFF',
  },
  lockedText: {
    fontSize: 18,
    color: '#A594F9',
    textAlign: 'center',
    padding: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'flex-end',
    marginBottom: 5,
    marginTop: 10,
  },
  buttonGap: {
    width: 70, // Adjust the width to set the gap between buttons
  },
});