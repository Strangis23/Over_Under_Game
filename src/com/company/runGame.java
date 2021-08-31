package com.company;

import java.util.Random;
import java.util.Scanner;

public class runGame {

    Scanner in = new Scanner(System.in);
    int gameLength = 0;
    double gameScore = 0;
    String gameReturnValue = "";


    public runGame() {



       if(gameIntro().equalsIgnoreCase("exit")){

           System.out.println("Thank you for playing");
           gameReturnValue = "exit";


        } else {

            for ( int i = 1 ; i <= gameLength ; i++ ){

                int count = 0;
                int maxTries = 3;
                while(true) {
                    try {
                        System.out.println("This is turn: " + i);
                        System.out.println("Which do you think will be larger A or B?");
                        String optionSelection =  in.next();

                        // System.out.println("This is in: " + optionSelection);

                        if (optionSelection.equalsIgnoreCase("A") || optionSelection.equalsIgnoreCase("B")) {
                            String turnOutcome = "" ;
                            turnOutcome= runTurn(optionSelection);

                            switch(turnOutcome) {
                                case "Correct":
                                    gameScore = gameScore +1;
                                    break;

                                case "Wrong":
                                    gameScore = gameScore + 0;
                                    break;

                                case "Draw":
                                    gameScore = gameScore + 0.5;
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

                System.out.println("This is the current score: " + gameScore);


            }

            System.out.println("This is the final score: " + gameScore + "/" + gameLength);

            gameReturnValue = gameScore + "/" + gameLength;

        }






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

                gameLength = 5;
                break;


            case "2":

                gameLength = 10;
                break;
            case "3":
                return "exit";


            default:
                System.out.println("You done messed up Ayayron");
                return "exit";



        }



        return returnValue;
    }

    public static String runTurn (String guess) {
        String returnValue ="";
        Random rand = new Random();

        int objectA = rand.nextInt(50);
        int objectB = rand.nextInt(50);

        System.out.println("This is object A: " + objectA);
        System.out.println("This is object B: " + objectB);


        if (guess.equals("A") ) {

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

}
