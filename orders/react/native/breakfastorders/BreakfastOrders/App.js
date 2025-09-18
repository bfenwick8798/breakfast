import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  RefreshControl,
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CONFIG } from './config';
import { getCurrentDate, formatDateForDisplay } from './utils/dateUtils';
import { loadBreakfastOrders, getApiErrorMessage } from './services/apiService';
import DebugDatePicker from './components/DebugDatePicker';

export default function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [completedOrders, setCompletedOrders] = useState(new Set()); // Track completed orders

  useEffect(() => {
    loadOrders(selectedDate);
  }, []);

useEffect(() => {
    if (selectedDate) {
      loadOrders(selectedDate);
      // Clear completed orders when switching dates
      setCompletedOrders(new Set());
    }
  }, [selectedDate]);

  async function loadOrders(date) {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== LOAD ORDERS DEBUG ===');
      console.log('Loading orders for date:', date);
      console.log('========================');
      
      const { orders, summary } = await loadBreakfastOrders(date);
      setOrders(orders);
      setSummary(summary);
      
    } catch (err) {
      console.error('Error in loadOrders:', err);
      setError(err.message);
      
      // Show user-friendly error message
      const { title, message } = getApiErrorMessage(err);
      Alert.alert(title, message);
    } finally {
      setLoading(false);
      setRefreshing(false);      

    }
  }

  function onRefresh() {
    setRefreshing(true);
    // Keep completed orders when refreshing - don't clear them
    loadOrders(selectedDate);
  }

  function toggleOrderCompletion(orderId) {
    setCompletedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  }

  function formatDate(dateString) {
    try {
      // Parse the date string in local timezone to avoid UTC conversion
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      // Use toDateString() which shows the correct date as you suggested
      return date.toDateString(); // e.g., "Wed Aug 06 2025"
    } catch {
      return dateString;
    }
  }

  function renderOrderItem(item, isCompleted = false) {
    // Get specific icon for each item
    const getItemIcon = (item) => {
      const name = item.name.toLowerCase();
      const description = item.description.toLowerCase();
      
      // Eggs
      if (name.includes('eggs')) {
        return '🍳';
      }
      
      // Sides
      if (name.includes('home fries')) {
        return '🍟';
      }
      if (name.includes('bacon')) {
        return '🥓';
      }
      if (name.includes('beans')) {
        return '🫘';
      }
      if (name.includes('toast')) {
        return '🍞';
      }
      
      // Main dishes with toppings
      if (name.includes('waffles')) {
        let icon = '🧇';
        if (description.includes('berries')) icon += '🍓';
        if (description.includes('whipped cream')) icon += '🍦';
        return icon;
      }
      if (name.includes('pancakes')) {
        let icon = '🥞';
        if (description.includes('berries')) icon += '🍓';
        if (description.includes('whipped cream')) icon += '🍦';
        return icon;
      }
      
      // Drinks
      if (name.includes('coffee') || name.includes('tea')) {
        return '☕';
      }
      if (name.includes('juice')) {
        let icon = '🧃';
        if (description.includes('apple')) icon += '🍎';
        if (description.includes('orange')) icon += '🍊';
        return icon;
      }
      if (name.includes('water')) {
        return '💧';
      }
      if (name.includes('milk')) {
        return '🥛';
      }
      
      // Default fallback
      return '🍽️';
    };

    return (
      <View key={`${item.category}-${item.name}`} style={[
        styles.orderItem,
        isCompleted && styles.completedOrderItem
      ]}>
        <Text style={styles.orderItemIcon}>
          {getItemIcon(item)}
        </Text>
        <Text style={[
          styles.orderItemText,
          isCompleted && styles.completedText
        ]}>
          {item.description}
        </Text>
      </View>
    );
  }

  function renderOrderCard(order, index) {
    const isCompleted = completedOrders.has(order.orderId);
    
    return (
      <View key={order.orderId || index} style={[
        styles.orderCard,
        isCompleted && styles.completedOrderCard
      ]}>
        <View style={styles.orderHeader}>
          <View style={styles.customerInfo}>
            <Text style={[
              styles.customerName,
              isCompleted && styles.completedText
            ]}>
              {order.customerName}
            </Text>
            <View style={styles.roomBadge}>
              <Text style={styles.roomText}>Room {order.roomNumber}</Text>
            </View>
          </View>
          <View style={styles.orderHeaderRight}>
            <Text style={[
              styles.orderTime,
              isCompleted && styles.completedText
            ]}>
              {order.scheduledTime}
            </Text>
            <TouchableOpacity
              style={[
                styles.checkbox,
                isCompleted && styles.checkedCheckbox
              ]}
              onPress={() => toggleOrderCompletion(order.orderId)}
              activeOpacity={0.7}
            >
              {isCompleted && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[
          styles.orderItems,
          isCompleted && styles.completedOrderItems
        ]}>
          {order.items.map(item => renderOrderItem(item, isCompleted))}
        </View>
        
        {order.specialOptions && (
          <View style={[
            styles.specialOptions,
            isCompleted && styles.completedSpecialOptions
          ]}>
            <Text style={styles.specialOptionsLabel}>Special:</Text>
            <Text style={[
              styles.specialOptionsText,
              isCompleted && styles.completedText
            ]}>
              {order.specialOptions}
            </Text>
          </View>
        )}
      </View>
    );
  }

  function renderSummaryItem(itemName, count) {
    return (
      <View key={itemName} style={styles.summaryItem}>
        <Text style={styles.summaryItemName}>{itemName}</Text>
        <Text style={styles.summaryItemCount}>{count}</Text>
      </View>
    );
  }

  // Calculate summary excluding completed orders
  function getAdjustedSummary() {
    if (!summary) return null;

    const completedOrderIds = Array.from(completedOrders);
    const activeOrders = orders.filter(order => !completedOrderIds.includes(order.orderId));
    
    // Recalculate item counts excluding completed orders
    const adjustedItemCounts = {};
    activeOrders.forEach(order => {
      order.items.forEach(item => {
        const itemName = item.name;
        adjustedItemCounts[itemName] = (adjustedItemCounts[itemName] || 0) + 1;
      });
    });

    return {
      ...summary,
      totalOrders: activeOrders.length,
      itemCounts: adjustedItemCounts
    };
  }

  // Sort orders to put completed ones at the bottom
  function getSortedOrders() {
    const completedOrderIds = Array.from(completedOrders);
    const activeOrders = orders.filter(order => !completedOrderIds.includes(order.orderId));
    const completedOrdersList = orders.filter(order => completedOrderIds.includes(order.orderId));
    
    return [...activeOrders, ...completedOrdersList];
  }

  function handleDateSelection(dateString) {
    console.log('=== DATE SELECTION FROM PICKER ===');
    console.log('Received date string:', dateString);
    console.log('==================================');
    setSelectedDate(dateString);
  }

  function handleDatePickerClose() {
    setShowDatePicker(false);
  }

  function renderDatePicker() {
    return (
      <DebugDatePicker
        visible={showDatePicker}
        selectedDate={selectedDate}
        onDateChange={handleDateSelection}
        onClose={handleDatePickerClose}
      />
    );
  }

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading breakfast orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🍳 Breakfast Orders</Text>
        <TouchableOpacity 
          style={styles.dateSelector}
          onPress={() => {
            console.log('Date selector pressed, setting showDatePicker to true');
            setShowDatePicker(true);
          }}
        >
          <Text style={styles.dateSelectorText}>
            {formatDateForDisplay(selectedDate)}
          </Text>
          <Text style={styles.dateSelectorIcon}>📅</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load data</Text>
          <TouchableOpacity onPress={() => loadOrders(selectedDate)}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Section */}
        {summary && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Summary</Text>
            
            <View style={styles.summaryStats}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{getAdjustedSummary().totalOrders}</Text>
                <Text style={styles.statLabel}>To Cook</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{completedOrders.size}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{summary.totalOrders}</Text>
                <Text style={styles.statLabel}>Total Orders</Text>
              </View>
            </View>

            {getAdjustedSummary().itemCounts && Object.keys(getAdjustedSummary().itemCounts).length > 0 && (
              <View style={styles.summaryItems}>
                <Text style={styles.summaryItemsTitle}>Items to Cook</Text>
                <View style={styles.summaryGrid}>
                  {Object.entries(getAdjustedSummary().itemCounts)
                    .sort(([,a], [,b]) => b - a)
                    .map(([item, count]) => renderSummaryItem(item, count))
                  }
                </View>
              </View>
            )}
          </View>
        )}

        {/* Orders Section */}
        <View style={styles.ordersSection}>
          <Text style={styles.sectionTitle}>
            Individual Orders ({orders.length})
          </Text>
          
          {orders.length === 0 ? (
            <View style={styles.noOrdersContainer}>
              <Text style={styles.noOrdersText}>
                No breakfast orders found for {formatDateForDisplay(selectedDate)}
              </Text>
              <Text style={styles.noOrdersSubtext}>
                Try selecting a different date or pull to refresh
              </Text>
            </View>
          ) : (
            getSortedOrders().map(renderOrderCard)
          )}
        </View>
      </ScrollView>

      {renderDatePicker()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 10,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
  },
  dateSelectorText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '500',
    marginRight: 8,
  },
  dateSelectorIcon: {
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  retryText: {
    color: '#1976D2',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  scrollView: {
    flex: 1,
  },
  summarySection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 15,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  summaryItems: {
    marginTop: 10,
  },
  summaryItemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryItem: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 80,
    alignItems: 'center',
  },
  summaryItemName: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
  },
  summaryItemCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  ordersSection: {
    margin: 15,
  },
  noOrdersContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noOrdersText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  noOrdersSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderHeaderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginRight: 10,
  },
  roomBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roomText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  orderTime: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  orderItems: {
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  orderItemIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  orderItemText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  specialOptions: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
    marginTop: 8,
  },
  specialOptionsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 2,
  },
  specialOptionsText: {
    fontSize: 14,
    color: '#856404',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#666',
  },
  dateList: {
    maxHeight: 400,
  },
  noDateOptions: {
    padding: 20,
    alignItems: 'center',
  },
  noDateOptionsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedDateOption: {
    backgroundColor: '#E3F2FD',
  },
  dateOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedDateText: {
    color: '#1976D2',
    fontWeight: '500',
  },
  dateOptionBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  dateOptionCount: {
    fontSize: 12,
    color: '#666',
  },
  todayBadge: {
    position: 'absolute',
    right: 16,
    top: 8,
    backgroundColor: '#4CAF50',
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: 'bold',
  },
  // Completion styles
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkedCheckbox: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedOrderCard: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa',
  },
  completedOrderItems: {
    opacity: 0.8,
  },
  completedOrderItem: {
    backgroundColor: '#e8f5e8',
    borderLeftColor: '#4CAF50',
  },
  completedSpecialOptions: {
    backgroundColor: '#f0f8f0',
    borderLeftColor: '#4CAF50',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
});
