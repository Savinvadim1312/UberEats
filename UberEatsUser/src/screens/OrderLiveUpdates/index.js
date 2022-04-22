import { DataStore } from "aws-amplify";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useState, useEffect } from "react";
import { Courier, Order } from "../../models";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRef } from "react";

const OrderLiveUpdates = ({ id }) => {
  const [order, setOrder] = useState(null);
  const [courier, setCourier] = useState(null);

  const mapRef = useRef(null);

  useEffect(() => {
    DataStore.query(Order, id).then(setOrder);
  }, []);

  useEffect(() => {
    if (!order) {
      return;
    }
    const subscription = DataStore.observe(Order, order.id).subscribe((msg) => {
      if (msg.opType === "UPDATE") {
        setOrder(msg.element);
      }
    });

    return () => subscription.unsubscribe();
  }, [order]);

  useEffect(() => {
    if (order?.orderCourierId) {
      DataStore.query(Courier, order.orderCourierId).then(setCourier);
    }
  }, [order?.orderCourierId]);

  useEffect(() => {
    if (courier?.lng && courier?.lat) {
      mapRef.current.animateToRegion({
        latitude: courier.lat,
        longitude: courier.lng,
        latitudeDelta: 0.007,
        longitudeDelta: 0.007,
      });
    }
  }, [courier?.lng, courier?.lat]);

  useEffect(() => {
    if (!courier) {
      return;
    }
    const subscription = DataStore.observe(Courier, courier.id).subscribe(
      (msg) => {
        if (msg.opType === "UPDATE") {
          setCourier(msg.element);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [courier]);

  return (
    <View>
      <Text>Status: {order?.status || "loading"}</Text>
      <MapView style={styles.map} ref={mapRef} showsUserLocation>
        {courier?.lat && (
          <Marker
            coordinate={{ latitude: courier.lat, longitude: courier.lng }}
          >
            <View
              style={{
                padding: 5,
                backgroundColor: "green",
                borderRadius: 40,
              }}
            >
              <FontAwesome5 name="motorcycle" size={24} color="white" />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});

export default OrderLiveUpdates;
