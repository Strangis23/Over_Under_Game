package com.company;

import java.util.Scanner;

public class runSeries {

    int currentSeriesScore;
    int currentSeriesTurns;
    runGame currentGame;
    String seriesOwner;
    String playerName;
    Scanner in ;

    public runSeries() {
        currentSeriesScore = 0;
        currentSeriesTurns = 0;
        seriesOwner = "";
        in = new Scanner(System.in);

            }

   public void beginSeries () {
       int beginSeriesValue;
       boolean continueSeries = true;
       System.out.println("Please enter your name: ");
           playerName = in.next();

           DBConnection currentPlayerDB = new DBConnection();

         //  currentPlayerDB.findPlayerHighScore(playerName);
       //System.out.println("This is Player_Name " + playerName);
       currentPlayerDB.findPlayerHighScore(playerName);

           seriesOwner = currentPlayerDB.currentSearchedPlayerName;
           currentSeriesScore = currentSeriesScore + currentPlayerDB.currentSearchedPlayerScore;
           currentSeriesTurns = currentSeriesTurns + currentPlayerDB.currentSearchedPlayerTurns;


       while (continueSeries) {
               System.out.println("Please enter a value below " + playerName);
               System.out.println("1. Begin game");
               System.out.println("2. Show high scores");
               System.out.println("3. Exit");

               beginSeriesValue = in.nextInt();

               switch (beginSeriesValue){

                   case 1:
                       runSeriesGame();
                       break;


                   case 2:
                       DBConnection.highScoreList();
                       break;

                   case 3:
                       //System.out.println("Thank you for playing " + playerName);
                       // currentPlayerDB.findPlayerHighScore(seriesOwner);
                       // System.out.println("This is the ending score " + currentSeriesScore);
                       // System.out.println("This is the ending Turns " + currentSeriesTurns);
                       currentPlayerDB.updatePlayerHighScore(playerName,currentSeriesScore,currentSeriesTurns);
                       currentPlayerDB.findPlayerHighScore(playerName);

                        continueSeries = false;
                       break;

               }

           }

   }




    public void runSeriesGame(){

        boolean keepPlaying = true;

        while (keepPlaying == true){

            //runGame firstGame = new runGame();

            currentGame = new runGame();

            currentGame.gamePlayer = playerName;
            currentGame.fullgameRun();


            if (currentGame.gameReturnValue.equalsIgnoreCase("exit")){

                keepPlaying =false;
            } else {
               // System.out.println("This is the current score before " +  currentSeriesScore);
                currentSeriesScore = (int) (currentGame.gameScore + currentSeriesScore);
                //System.out.println("This is the current score after " +  currentSeriesScore);

                //System.out.println("This is the current turns before " +  currentSeriesTurns);
                currentSeriesTurns = currentGame.gameTurns + currentSeriesTurns;
                //System.out.println("This is the current turns after " +  currentSeriesTurns);
            }


        }
    }
}
