package com.company;

import java.util.Random;
import java.util.Scanner;

public class runGame extends runSeries {

    Scanner in ;
    int gameLength;
    int gameTurns;
    double gameScore;
    String gameReturnValue;
    String gamePlayer;


    public runGame() {

        in = new Scanner(System.in);
        gameLength = 0;
        gameScore = 0;
        gameTurns = 0;
        gameReturnValue = "";
        gamePlayer = "";

    }

    public void fullgameRun(){

        gameRunner();
    }

    public String gameIntro(){
        String returnValue = "" ;

        System.out.println("This is the Over/Under game, where you guess which is bigger.");
        System.out.println("What would you like to play?");
        System.out.println("1. Quick Game (5 moves)");
        System.out.println("2. Long Game (10 moves)");
        System.out.println("3. Exit Game");

        String nextGameInput =  in.next();


        switch (nextGameInput){
            case "1":

                this.gameLength = 5;
                break;


            case "2":

                this.gameLength = 10;
                break;
            case "3":
                return "exit";


            default:
                System.out.println("You done messed up Ayayron");
                return "exit";



        }



        return returnValue;
    }

    public static String runTurn (String guess,String playerNameA,Double  playerAttributeA,String playerNameB,Double playerAttributeB) {
        String returnValue ="";
        Random rand = new Random();

        Double objectA = playerAttributeA;
        Double objectB = playerAttributeB;


        System.out.println("This is " + playerNameA  + "'s " + objectA);
        System.out.println("This is " + playerNameB  + "'s " + + objectB);


        if (guess.equalsIgnoreCase("A") ) {

            if (objectA > objectB){
                returnValue = "Correct";
            }else if (objectA < objectB) {
                returnValue = "Wrong";
            } else {
                returnValue = "Draw";
            }
        }else {


            if (objectA < objectB){
                returnValue = "Correct";
            }else if (objectA > objectB) {
                returnValue = "Wrong";
            } else {
                returnValue = "Draw";
            }



        }

        return returnValue;
    }

    public void gameRunner(){


        if(gameIntro().equalsIgnoreCase("exit")){

            System.out.println("Thank you for playing");
            gameReturnValue = "exit";


        } else {

            System.out.println("This is game length " + gameLength);

            for ( int i = 1 ; i <= gameLength ; i++ ){

                int count = 0;
                int maxTries = 3;
                while(true) {
                    try {

                        DBConnection connTurn = new DBConnection();

                        connTurn.findNBAPlayer("PPG");
                        String nbaPlayerAName;
                        nbaPlayerAName = connTurn.getCurrentNBAPlayerName();
                        Double nbaPlayerAAtt = connTurn.getCurrentNBAPlayerAttribute();

                        connTurn.findNBAPlayer("PPG");
                        String nbaPlayerBName = connTurn.getCurrentNBAPlayerName();
                        Double nbaPlayerBAtt = connTurn.getCurrentNBAPlayerAttribute();


                        System.out.println("This is turn: " + i);
                        System.out.println("Who do you think has a higher PPG");
                        System.out.println("A. " + nbaPlayerAName);
                        System.out.println("B. " + nbaPlayerBName);



                        //System.out.println("Which do you think will be larger A or B?");
                        String optionSelection =  in.next();

                        // System.out.println("This is in: " + optionSelection);

                        if (optionSelection.equalsIgnoreCase("A") || optionSelection.equalsIgnoreCase("B")) {
                            String turnOutcome = "" ;



                            turnOutcome= runTurn(optionSelection, nbaPlayerAName,nbaPlayerAAtt,nbaPlayerBName,nbaPlayerBAtt);

                            switch(turnOutcome) {
                                case "Correct":
                                    gameScore = gameScore +1;
                                    gameTurns = gameTurns +1;

                                    break;

                                case "Wrong":
                                    gameScore = gameScore + 0;
                                    gameTurns = gameTurns +1;
                                    break;

                                case "Draw":
                                    gameScore = gameScore + 0.5;
                                    gameTurns = gameTurns +1;
                                    break;



                            }


                            break;
                        } else {

                            if (++count >= maxTries) throw new Exception(); ;
                            System.out.println("Please enter either A or B");


                        }

                    } catch (Exception e) {

                        System.out.println("You didn't enter either A or B idiot");
                        System.out.println("Now you lose a turn");
                        break;
                    }
                }

                System.out.println("This is the current score: " + gameScore + "/" +i);


            }

            System.out.println("This is the final score: " + gameScore + "/" + gameTurns);


            this.currentSeriesScore = (int) gameScore;
            this.currentSeriesTurns = gameTurns;

            gameReturnValue = gameScore + "/" + gameTurns;

        }



    }


}
