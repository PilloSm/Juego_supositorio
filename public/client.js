$(document).ready(function () {
  var game = {};

  $("#board").hide();
  $("#remake").hide();

  var socket = io();

  const gameId = getGameId();
  if (gameId) {
    socket.emit("join", { gameID: gameId });
  }

  $("#create").on("click", function () {
    socket.emit("create");
    $(".item").hide();
  });

  $("#remake").on("click", function () {
    socket.emit("restart", { id: game.id });
  });

  socket.on("created", function (data) {
    const url = window.location.href + "?gameId=" + data.id;
    $("#status").html(`Envia el link a otra persona o dile el gameId`);
    $("#link").text(url);
    $("#link").show();
  });

  socket.on("start", function (data) {
    $("#remake").hide();
    $(".item").hide();
    $("#link").hide();

    game.id = data.id;
    game.board = data.gameboard;
    game.player = data.player;

    $("#board").show();
    updateGameboard();
  });

  socket.on("failed", function () {
    $("#status").html("No se encontro");
    $(".title").hide();
    $("#create").hide();
  });

  socket.on("invalid", function () {
    alert("erroneo");
    $("#status").html("Equivocao pa");
  });

  $("table").on("click", function (e) {
    let cellClicked = e.target.id;

    if (game.player.turn === true) {
      if (game.board[cellClicked] === "") {
        let data = { id: game.id, cell: cellClicked, player: game.player };
        socket.emit("move", data);
      } else {
        $("#status").html("No sea troll");
      }
    } else {
      $("#status").html("Estas ansioso de veras de llegar pronto a su casa...");
    }
  });

  socket.on("updateGame", function (data) {
    game.player.turn = !game.player.turn;
    game.board = data.gameboard;

    updateGameboard();
  });

  socket.on("win", function (data) {
    game.board = data;
    updateGameboard();

    $("#status").html("tu as gaigne!!!!");
    $("#remake").show();
    function showGameOverAnimation() {
      const gameOverMessage = document.getElementById("gameOverMessage");
      gameOverMessage.classList.add("fadeInOut");

      setTimeout(() => {
        location.reload(); //  la página después de 2 segundos
      }, 2000);
    }

    showGameOverAnimation();
  });

  socket.on("lose", function (data) {
    game.board = data;
    updateGameboard();

    $("#status").html("Perdiste papu");
    $("#remake").show();
  });

  socket.on("tie", function (data) {
    game.board = data.gameboard;
    updateGameboard();

    $("#status").html("Tie.");
    $("#remake").show();
  });

  socket.on("quit", function () {
    $("#status").html("Cree otro juego pa.");
    $("#board").hide();
    $(".item").show();
    $(".title").hide();
    $("#remake").hide();
  });

  function updateGameboard() {
    $.each(game.board, function (key, value) {
      if (value == "X") {
        $("#" + key)
          .removeClass("red")
          .addClass("blue");
      } else {
        $("#" + key)
          .removeClass("blue")
          .addClass("red");
      }

      $("#" + key).html(value);
    });

    if (game.player.turn) {
      $("#status").html("Tu turno");
    } else {
      $("#status").html("Es del otro");
    }
  }
});
