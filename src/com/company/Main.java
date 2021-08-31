package com.company;

import java.io.IOException;
import java.util.Scanner;
import java.util.Random;

public class Main {

    public static void main(String[] args) {

        boolean keepPlaying = true;

        while (keepPlaying == true){

            runGame firstGame = new runGame();

            if (firstGame.gameReturnValue.equalsIgnoreCase("exit")){

                keepPlaying =false;
            }


        }






    }

}

