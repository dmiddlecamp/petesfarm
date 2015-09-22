// This #include statement was automatically added by the Particle IDE.
#include "SparkFun_MPL3115A2.h"

// This #include statement was automatically added by the Particle IDE.
#include "HTU21D.h"

#include "OneWire.h"
#include "DallasTemperature.h"

/******************************************************************************
  SparkFun_Photon_Weather_Basic_Soil.ino
  SparkFun Photon Weather Shield basic example with soil moisture and temp
  Joel Bartlett @ SparkFun Electronics
  Original Creation Date: May 18, 2015
  This sketch prints the temperature, humidity, barrometric preassure, altitude,
  to the Seril port.

  Hardware Connections:
	This sketch was written specifically for the Photon Weather Shield,
	which connects the HTU21D and MPL3115A2 to the I2C bus by default.
  If you have an HTU21D and/or an MPL3115A2 breakout,	use the following
  hardware setup:
      HTU21D ------------- Photon
      (-) ------------------- GND
      (+) ------------------- 3.3V (VCC)
       CL ------------------- D1/SCL
       DA ------------------- D0/SDA

    MPL3115A2 ------------- Photon
      GND ------------------- GND
      VCC ------------------- 3.3V (VCC)
      SCL ------------------ D1/SCL
      SDA ------------------ D0/SDA


    DS18B20 Temp Sensor ------ Photon
        VCC (Red) ------------- 3.3V (VCC)
        GND (Black) ----------- GND
        SIG (White) ----------- D4

  Development environment specifics:
  	IDE: Particle Dev
  	Hardware Platform: Particle Photon
                       Particle Core

  This code is beerware; if you see me (or any other SparkFun
  employee) at the local, and you've found our code helpful,
  please buy us a round!
  Distributed as-is; no warranty is given.
*******************************************************************************/


int WDIR = A0;
int RAIN = D2;
int WSPEED = D3;


float humidity = 0;
float tempf = 0;
float pascals = 0;
float altf = 0;
float baroTemp = 0;
int count = 0;

volatile long lastWindIRQ = 0;
volatile byte windClicks = 0;

unsigned int lastPublish;
float rainin = 0; // [rain inches over the past hour)] -- the accumulated rainfall in the past 60 min
long lastWindCheck = 0;
volatile float dailyrainin = 0; // [rain inches so far today in local time]

#define ONE_WIRE_BUS D4
#define TEMPERATURE_PRECISION 11
float inSoilTemperature = 0;

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

HTU21D htu = HTU21D();//create instance of HTU21D Temp and humidity sensor
MPL3115A2 baro = MPL3115A2();//create instance of MPL3115A2 barrometric sensor

//---------------------------------------------------------------
void setup()
{
    Serial.begin(9600);   // open serial over USB at 9600 baud

    Spark.publish("farm_weather", "online_1.2");

    // DS18B20 initialization
    sensors.begin();
    sensors.setResolution(TEMPERATURE_PRECISION);



    //Initialize both on-board sensors
    //Initialize both on-board sensors
    while(! htu.begin()){
        Serial.println("HTU21D not found");
        delay(1000);
    }
    Serial.println("HTU21D OK");

    while(! baro.begin()) {
        Serial.println("MPL3115A2 not found");
        delay(1000);
    }
    Serial.println("MPL3115A2 OK");

    //MPL3115A2 Settings
    //baro.setModeBarometer();//Set to Barometer Mode
    baro.setModeAltimeter();//Set to altimeter Mode

    baro.setOversampleRate(7); // Set Oversample to the recommended 128
    baro.enableEventFlags(); //Necessary register calls to enble temp, baro ansd alt

    // attach external interrupt pins to IRQ functions
    //attachInterrupt(RAIN, rainIRQ, FALLING);
    attachInterrupt(WSPEED, wspeedIRQ, FALLING);

}
//---------------------------------------------------------------
void loop()
{
    //Get readings from all sensors
    calcWeather();

    //Rather than use a delay, keeping track of a counter allows the photon to
    //still take readings and do work in between printing out data.
    
    unsigned int now = millis();
    if ((now - lastPublish) > 60000) {
      printInfo();
      lastPublish = now;
    }
    

    //   count++;
    //   //alter this number to change the amount of time between each reading
    //   if(count == 5)//prints roughly every 10 seconds for every 5 counts
    //   {
    //      printInfo();
    //      count = 0;
    //   }
}
//---------------------------------------------------------------
void printInfo()
{
    //This function prints the weather data out to the default Serial Port

    //float averageTemperature = (tempf+baroTemp)/2;
    
    String dataJson = "{\"temp1\": " + String(tempf)
                    + ", \"temp2\": " + String(baroTemp) 
                    + ", \"humidity\": " + String(humidity) 
                    + ", \"pressure\": " + String(pascals) 
                    + ", \"altitude\": " + String(altf) 
                    + ", \"wind_mph\": " + String(get_wind_speed())
                    + ", \"soilTemp\": " + String(inSoilTemperature)
                    //+ ", \"hum\": " + humidity 
                    + "}";
                    
    
    Spark.publish("farm/weather", dataJson);

    // //Take the temp reading from each sensor and average them.
    // Serial.print("Temp:");
    // Serial.print(averageTemperature);
    // Serial.print("F, ");

    //Or you can print each temp separately
    /*Serial.print("HTU21D Temp: ");
    Serial.print(tempf);
    Serial.print("F, ");
    Serial.print("Baro Temp: ");
    Serial.print(baroTemp);
    Serial.print("F, ");*/


    // Serial.print("Humidity:");
    // Serial.print(humidity);
    // Serial.print("%, ");


    // Serial.print("Pressure:");
    // Serial.print(pascals);
    // Serial.print("Pa, ");

    // Serial.print("Altitude:");
    // Serial.print(altf);
    // Serial.println("ft.");

}
//---------------------------------------------------------------
void getTempHumidity()
{
    float temp = 0;

    temp = htu.readTemperature();
    tempf = (temp * 9)/5 + 32;

    humidity = htu.readHumidity();
}
//---------------------------------------------------------------
void getBaro()
{
  baroTemp = baro.readTempF();//get the temperature in F

  pascals = baro.readPressure();//get pressure in Pascals

  altf = baro.readAltitudeFt();//get altitude in feet
}
//---------------------------------------------------------------
void calcWeather()
{
    getTempHumidity();
    getBaro();
    updateSoilTemp();
}

void updateSoilTemp() {
    int count = sensors.getDeviceCount();
    if (count == 0) {
        return;
    }
    sensors.requestTemperatures();
    inSoilTemperature = sensors.getTempFByIndex(0);
}


void wspeedIRQ()
// Activated by the magnet in the anemometer (2 ticks per rotation), attached to input D3
{
  if (millis() - lastWindIRQ > 10) // Ignore switch-bounce glitches less than 10ms (142MPH max reading) after the reed switch closes
  {
    lastWindIRQ = millis(); //Grab the current time
    windClicks++; //There is 1.492MPH for each click per second.
  }
}


//---------------------------------------------------------------
//Read the wind direction sensor, return heading in degrees
int get_wind_direction()
{
  unsigned int adc;

  adc = analogRead(WDIR); // get the current reading from the sensor

  // The following table is ADC readings for the wind direction sensor output, sorted from low to high.
  // Each threshold is the midpoint between adjacent headings. The output is degrees for that ADC reading.
  // Note that these are not in compass degree order! See Weather Meters datasheet for more information.

  if(adc > 2270 && adc < 2290) return (0);//North
  if(adc > 3220 && adc < 3240) return (1);//NE
  if(adc > 3890 && adc < 3910) return (2);//East
  if(adc > 3780 && adc < 3800) return (3);//SE

  if(adc > 3570 && adc < 3590) return (4);//South
  if(adc > 2790 && adc < 2810) return (5);
  if(adc > 1580 && adc < 1610) return (6);
  if(adc > 1930 && adc < 1950) return (7);

  return (-1); // error, disconnected?
}
//---------------------------------------------------------------
//Returns the instataneous wind speed
float get_wind_speed()
{
  float deltaTime = millis() - lastWindCheck; //750ms

  deltaTime /= 1000.0; //Covert to seconds

  float windSpeed = (float)windClicks / deltaTime; //3 / 0.750s = 4

  windClicks = 0; //Reset and start watching for new wind
  lastWindCheck = millis();

  windSpeed *= 1.492; //4 * 1.492 = 5.968MPH

  /* Serial.println();
   Serial.print("Windspeed:");
   Serial.println(windSpeed);*/

  return(windSpeed);
}

//---------------------------------------------------------------