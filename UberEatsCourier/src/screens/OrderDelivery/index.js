import { useRef, useEffect, useState } from "react";
import { View, useWindowDimensions, ActivityIndicator } from "react-native";
import styles from "./styles";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import MapViewDirections from "react-native-maps-directions";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useOrderContext } from "../../contexts/OrderContext";
import BottomSheetDetails from "./BottomSheetDetails";
import CustomMarker from "../../components/CustomMarker";
import { DataStore } from "aws-amplify";
import { Courier } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";

const OrderDelivery = () => {
  const { order, user, fetchOrder } = useOrderContext();
  const { dbCourier } = useAuthContext();

  const [driverLocation, setDriverLocation] = useState(null);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalKm, setTotalKm] = useState(0);

  const mapRef = useRef(null);
  const { width, height } = useWindowDimensions();

  const navigation = useNavigation();
  const route = useRoute();
  const id = route.params?.id;

  useEffect(() => {
    fetchOrder(id);
  }, [id]);

  useEffect(() => {
    if (!driverLocation) {
      return;
    }
    DataStore.save(
      Courier.copyOf(dbCourier, (updated) => {
        updated.lat = driverLocation.latitude;
        updated.lng = driverLocation.longitude;
      })
    );
  }, [driverLocation]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (!status === "granted") {
        console.log("Nonono");
        return;
      }

      let location = await Location.getCurrentPositionAsync();
      setDriverLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();

    const foregroundSubscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 500,
      },
      (updatedLocation) => {
        setDriverLocation({
          latitude: updatedLocation.coords.latitude,
          longitude: updatedLocation.coords.longitude,
        });
      }
    );
    return foregroundSubscription;
  }, []);

  const zoomInOnDriver = () => {
    mapRef.current.animateToRegion({
      latitude: driverLocation.latitude,
      longitude: driverLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const restaurantLocation = {
    latitude: order?.Restaurant?.lat,
    longitude: order?.Restaurant?.lng,
  };
  const deliveryLocation = {
    latitude: user?.lat,
    longitude: user?.lng,
  };

  if (!order || !user || !driverLocation) {
    return <ActivityIndicator size={"large"} color="gray" />;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={{ width, height }}
        showsUserLocation
        followsUserLocation
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.07,
          longitudeDelta: 0.07,
        }}
      >
        <MapViewDirections
          origin={driverLocation}
          destination={
            order.status === "ACCEPTED" ? restaurantLocation : deliveryLocation
          }
          strokeWidth={10}
          waypoints={
            order.status === "READY_FOR_PICKUP" ? [restaurantLocation] : []
          }
          strokeColor="#3FC060"
          apikey={"AIzaSyA40_jSaAHHq6J3o3HKJujVrMHv9gcSV3E"}
          onReady={(result) => {
            setTotalMinutes(result.duration);
            setTotalKm(result.distance);
          }}
        />
        <CustomMarker data={order.Restaurant} type="RESTAURANT" />
        <CustomMarker data={user} type="USER" />
      </MapView>
      <BottomSheetDetails
        totalKm={totalKm}
        totalMinutes={totalMinutes}
        onAccepted={zoomInOnDriver}
      />
      {order.status === "READY_FOR_PICKUP" && (
        <Ionicons
          onPress={() => navigation.goBack()}
          name="arrow-back-circle"
          size={45}
          color="black"
          style={{ top: 40, left: 15, position: "absolute" }}
        />
      )}
    </View>
  );
};

export default OrderDelivery;
