


let positionCard = (id) => {

  let posX = 0;
  let posY = 0;

  if( id % 2 == 0 ){
    posY = 1;
  }

  // columns
  switch (id){
    case 0:
      posX = 1;
      posY = 1;
      break;
    case 1:
      posX = 2;
      posY = 1;
      break;
    case 2:
      posX = 1;
      posY = 0;
      break;
    case 3:
      posX = 2;
      posY = 0;
      break;
    case 4:
      posX = 3;
      posY = 0;
      break;
    case 5:
      posX = 3;
      posY = 1;
      break;
    case 6:
      posX = 0;
      posY = 0;
      break;
    case 7:
      posX = 0;
      posY = 1;
      break;
  }

  return {
    x: posX,
    y: posY
  }

}



export {positionCard}
