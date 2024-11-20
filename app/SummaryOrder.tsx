import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Order {
  id: string;
  code: string; 
  fullname: string;
  category: string;
  categoryType: string;
  description: string;
  quantity: number;
}

const API_URL = 'https://itdgyec.localto.net/order/save';


const CustomAlert: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <Modal transparent={true} animationType="slide" visible={true}>
    <View style={styles.alertContainer}>
      <View style={styles.alertBox}>
        <Text style={styles.alertMessage}>{message}</Text>
        <TouchableOpacity onPress={onClose} style={styles.alertButton}>
          <Text style={styles.alertButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const OrderReviewScreen: React.FC = () => {
  const router = useRouter();
  const { cartItems, tableNumber } = useLocalSearchParams();
  const [waiterCode, setWaiterCode] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [name, setName] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [serverIP, setServerIP] = useState<string>('');


  const stage :string = 'dev'// 'Local' or 'Production'

  // Fetch waiter code from AsyncStorage
  const fetchWaiterCode = async () => {
    try {
      const storedWaiterCode = await AsyncStorage.getItem('waiterCode');
      const storedServerIP = await AsyncStorage.getItem('serverIP');
      if (storedWaiterCode) setWaiterCode(storedWaiterCode);
      if (storedServerIP) setServerIP(storedServerIP);
    } catch (error) {
      console.error('Error fetching waiterCode:', error);
    }
  };


  // Parse cart items and initialize orders on component mount
  useEffect(() => {
    if (cartItems) {
      const parsedCartItems = JSON.parse(cartItems as string);
      const initialOrders: Order[] = parsedCartItems.map((cartItem: any) => ({
        fullname: cartItem.item.fullname,
        itemCode: cartItem.item.code,
        description: cartItem.keterangan,
        portion: cartItem.item.categoryType,
        category: cartItem.item.category,
        quantity: cartItem.quantity,
      }));

      const menuItemsWithId = initialOrders.map((item, index) => ({
        ...item,
        id: (index + 1).toString(),
      }));

      
      setOrders(menuItemsWithId);
    }
    fetchWaiterCode();
  }, [cartItems]);

  // Handle quantity change for an item
  const handleQuantityChange = (id: string, change: number) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, quantity: Math.max(1, order.quantity + change) } : order
      )
    );
  };

  // Submit the order to the backend or simulate submission
  const handleOrderSubmission = async () => {
    if (!name.trim()) {
      setAlertMessage('Please enter your name.');
      return;
    }

    // Prepare data for submission
    const payload = {
      waiterCode,
      tableNumber: parseInt(tableNumber as string),
      customerName: name,
      orderDetails:orders.map(({ id, ...rest }) => rest),
    };

    try {
      const getBEIP = await AsyncStorage.getItem('serverBEIP');
      const storedServerIP = `http://${getBEIP}/menu/list/all`;
      setServerIP(storedServerIP);

      // Determine the correct API URL
      const API_URL = stage === 'dev' ? 'https://itdgyec.localto.net/menu/list/all' : storedServerIP;
      const response = await axios.post(API_URL, payload);
      setAlertMessage('Order submitted successfully!');
      router.push('/');  // Navigate back to home or another screen
    } catch (error) {
      setAlertMessage('Failed to submit order. Please try again.');
    }
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemText}>{item.fullname}</Text>
        <Text style={styles.noteText}>{item.description}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => handleQuantityChange(item.id, -1)}>
          <Ionicons name="remove-circle-outline" size={24} color="#4C3A8C" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => handleQuantityChange(item.id, 1)}>
          <Ionicons name="add-circle-outline" size={24} color="#4C3A8C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const totalItems = orders.reduce((total, order) => total + order.quantity, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#4C3A8C" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Summary</Text>
      </View>
      <View style={styles.tableInfo}>
        <Text style={styles.tableText}>You're in table: {tableNumber || 'N/A'}</Text>
        <View style={styles.nameContainer}>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Customer Name"
          />
          <Ionicons name="pencil" size={20} color="#7B68EE" />
        </View>
      </View>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsText}>Total items: {totalItems}</Text>
      </View>
      <TouchableOpacity style={styles.orderButton} onPress={handleOrderSubmission}>
        <View style={styles.buttonBackground}>
          <Text style={styles.buttonText}>Order!</Text>
        </View>
      </TouchableOpacity>
      {alertMessage && <CustomAlert message={alertMessage} onClose={() => setAlertMessage(null)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5EFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 27,
    marginRight: 70,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4C3A8C',
    right: 45
  },
  tableInfo: {
    marginBottom: 20,
  },
  tableText: {
    fontSize: 20,
    color: 'black',
    marginBottom: 10,
    fontWeight: 'bold',

  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#7B68EE',
    flex: 1,
    marginRight: 10,
    fontSize: 16,
    color: '#4C3A8C',
  },
  list: {
    flex: 1,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemDetails: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4C3A8C',
  },
  noteText: {
    fontSize: 14,
    color: '#4C3A8C',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#4C3A8C',
  },
  detailsContainer: {
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 20,
  },
  detailsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4C3A8C',
    textAlign: 'center',
  },
  orderButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
    backgroundColor: '#7B68EE',
  },
  buttonBackground: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
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
});

export default OrderReviewScreen;