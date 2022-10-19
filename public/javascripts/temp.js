

function delUser(val) {

  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this Records!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
    .then((willDelete) => {
      if (willDelete) {
        swal("Your records has been deleted!", {
          icon: "success",
        })
        location.href = `/deleteuser/${val}`;
      } else {
        swal("Your records is safe!");
      }
    });

}
// function updateuser(data) {

//   swal("Good job!", "Data updated!", "success");
//   return location.href = `/edituser/${data}`;
  
// }




