import React, {useState, useEffect} from 'react'

import styles from './OtherPlayerUI.module.css';

import Card from '../Card'

import {positionCard} from '../utils'

const OtherPlayerUI = (props) => {

  const [cardPositions,setCardPositions] = useState([]);

  let classes = [styles.OtherPlayerUI];
  classes.push(props.className);

  // map
  let cards = null;

  useEffect( ()=>{

    let arr = props.cards.map( (c,k)=>{

      let slot = positionCard(k);

      return {
        ...c,
        slot: slot
      }

    });

    setCardPositions(arr);

  }, [props.cards])

  if( cardPositions && cardPositions.length > 0 ){

    cards = cardPositions.map( (c,k)=>{

      let cardStyle = {
        left: 'calc( var(--card-margin) + ( var(--card-width) + var(--card-margin) ) * '+c.slot.x+' )',
        top: 'calc( var(--card-margin) + ( var(--card-height) + var(--card-margin) ) * '+c.slot.y+' )'
      };

      return( <Card
        className={styles.CardGrid_Card.toString()}
        style={cardStyle}
        symbol={c.color}
        number={c.value}
        key={'player-'+props.player.name+'-Card_'+k}
        //isBack

        /> )
    } )
  }

  return (
    <div className={classes.join(" ")} key={'player-no_'+props.k}>

      <div className={styles.CardGrid}>
        {cards}
      </div>


      <div className={styles.Name}>
        {props.player.name}
      </div>

    </div>
  )
}

export default OtherPlayerUI
