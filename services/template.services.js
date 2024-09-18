const boom = import('@hapi/boom');
class templateService {

  constructor(){

  }

  create() {
    res.status(201).json({
      message: 'Post created',
      data: body
    });
  }

  read() {

  }

  readOne(itemId) {

  }


  update(itemId) {

  }

  delete(itemId){

  }

}

module.exports = templateService;
