import { View, Text } from 'react-native'
import React from 'react'

const Overlay = () => {
  return (
    <View className='h-full w-full bg-black/20 flex justify-center items-center' >
      <View className='bg-transparent rounded-xl p-4 w-[200px] h[100px] '> 

      </View>
      <Text>Scan here</Text>
    </View>
  )
}

export default Overlay