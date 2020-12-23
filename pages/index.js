// React
import React, { useEffect, useState, useRef } from 'react'


// Components
import Head from '../components/Head'
import Footer from '../components/Footer'

import Game from '../components/Kaboom/Game'

const Home = () => {

  let classes = ['home'];

  return (
    <div className={classes.join(' ')}>

      <Head title="Kaboom" />

      <Game />

    </div>
  )
}

export default Home
