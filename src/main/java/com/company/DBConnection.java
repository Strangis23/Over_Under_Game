package com.company;

import java.sql.*;

public class DBConnection {


     String currentSearchedPlayerName;
     Integer currentSearchedPlayerScore;
     Integer currentSearchedPlayerTurns;
     String currentNBAPlayerName;
     Double currentNBAPlayerAttribute;

    public DBConnection() {

        currentSearchedPlayerName="";
        currentSearchedPlayerScore = 0;
        currentSearchedPlayerTurns = 0;
        currentNBAPlayerName ="";
        currentNBAPlayerAttribute = 0.0;



    }

    public Connection connection() throws ClassNotFoundException {

        // connection variables
        Connection c = null;

        //try to connect to the database

        Class.forName("org.sqlite.JDBC");
        try {
            c = DriverManager.getConnection("jdbc:sqlite:D:/Workbench/Over_Under_DB/OverUnderDB.db");
        } catch (SQLException e) {
            e.printStackTrace();
        }
        try {
            c.setAutoCommit(false);
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return  c;
    }

    public static void highScoreList() {

        // connection variables

        Connection c = null;
        Statement stmt = null;


        try {
            //try to connect to the database

            Class.forName("org.sqlite.JDBC");
            c = DriverManager.getConnection("jdbc:sqlite:D:/Workbench/Over_Under_DB/OverUnderDB.db");
            c.setAutoCommit(false);

            //create a statement

            stmt = c.createStatement();
            ResultSet rs = stmt.executeQuery( "Select * from player\n" +
                    "Order by percentage desc, turns desc" );

            //loop through results

            System.out.format("%25s %10s %10s %10s\n", "Player_Name", "score", "turns", "percentage" );

            while ( rs.next() ) {
                String Player_Name = rs.getString("Player_Name");
                int  score = rs.getInt("score");
                int turns  = rs.getInt("turns");
                double  percentage = rs.getInt("percentage");

                System.out.format("%25s %10s %10s %10s\n", Player_Name , score , turns , percentage);



               //System.out.println( "Player_Name = " + Player_Name );
                //System.out.println( "score = " + score );
                //System.out.println( "turns = " + turns );
                //System.out.println( "percentage = " + percentage );
                //System.out.println();
            }

            //close connection
            rs.close();
            stmt.close();
            c.close();
        } catch ( Exception e ) {
            System.err.println( e.getClass().getName() + ": " + e.getMessage() );
            System.exit(0);
        }
    }



    public void updatePlayerHighScore(String playerName , int playerScore , int playerTurn) {

        // connection variables


        Connection c = null;
        Statement stmt = null;


        try {
            //try to connect to the database

            Class.forName("org.sqlite.JDBC");
            c = DriverManager.getConnection("jdbc:sqlite:D:/Workbench/Over_Under_DB/OverUnderDB.db");
            c.setAutoCommit(true);

            //create a statement

            String sql = "insert or replace into player (Player_Name, score, turns) " +
                    "values( '" + playerName + "' ," + playerScore + "," + playerTurn + ")";


            PreparedStatement ps = c.prepareStatement(sql);
            ps.executeUpdate();

            ps.close();
            c.close();
        } catch ( Exception e ) {
            System.err.println( e.getClass().getName() + ": " + e.getMessage() );
            System.exit(0);
        }


    }

    public void findPlayerHighScore(String playerName) {

       // System.out.println("This is Playername " + playerName);

        // connection variables

        Connection c = null;
        Statement stmt = null;

        // String[] player = new String[0];
        try {
            //try to connect to the database

            Class.forName("org.sqlite.JDBC");
            c = DriverManager.getConnection("jdbc:sqlite:D:/Workbench/Over_Under_DB/OverUnderDB.db");
            c.setAutoCommit(false);

            //create a statement

            stmt = c.createStatement();

            ResultSet rs;
            rs = stmt.executeQuery("Select * from player where Player_Name = '" + playerName + "'");

            //loop through results

            System.out.format("%25s %10s %10s %10s\n", "Player_Name", "score", "turns", "percentage");

            while (rs.next()) {
                String Player_Name = rs.getString("Player_Name");
                int score = rs.getInt("score");
                int turns = rs.getInt("turns");
                double percentage = rs.getInt("percentage");

               // System.out.println("This is Player_Name " + Player_Name);

                if (Player_Name.isBlank()){
                    currentSearchedPlayerName = playerName;
                }else {
                    currentSearchedPlayerName = Player_Name;
                }


                currentSearchedPlayerScore = score;
                currentSearchedPlayerTurns = turns;

                System.out.format("%25s %10s %10s %10s\n", currentSearchedPlayerName, score, turns, percentage);


                //System.out.println( "Player_Name = " + Player_Name );
                //System.out.println( "score = " + score );
                //System.out.println( "turns = " + turns );
                //System.out.println( "percentage = " + percentage );
                //System.out.println();
            }

            //close connection
            rs.close();
            stmt.close();
            c.close();
        } catch (Exception e) {
            System.err.println(e.getClass().getName() + ": " + e.getMessage());
            System.exit(0);
        }

    }


    public void findNBAPlayer (String playerAttribute) {


        // connection variables

        Connection c = null;
        Statement stmt = null;

        // String[] player = new String[0];
        try {
            //try to connect to the database

            Class.forName("org.sqlite.JDBC");
            c = DriverManager.getConnection("jdbc:sqlite:D:/Workbench/Over_Under_DB/OverUnderDB.db");
            c.setAutoCommit(false);

            //create a statement

            stmt = c.createStatement();

            ResultSet rs;
            rs = stmt.executeQuery("Select NBAPlayerName ," + playerAttribute +  " from NBAPlayers Order by RANDOM() limit 2;");

            //loop through results

           // System.out.format("%25s %10s\n", "Player_Name", "score", "turns", "percentage");

            while (rs.next()) {
                String Player_Name = rs.getString("NBAPlayerName");
                double NBAPlayerAttribe = rs.getInt(playerAttribute);

                this.currentNBAPlayerName = Player_Name;
                this.currentNBAPlayerAttribute = NBAPlayerAttribe;




              //  System.out.format("%25s %10s\n", currentNBAPlayerName, currentNBAPlayerAttribute);


                //System.out.println( "Player_Name = " + Player_Name );
                //System.out.println( "score = " + score );
                //System.out.println( "turns = " + turns );
                //System.out.println( "percentage = " + percentage );
                //System.out.println();
            }

            //close connection
            rs.close();
            stmt.close();
            c.close();
        } catch (Exception e) {
            System.err.println(e.getClass().getName() + ": " + e.getMessage());
            System.exit(0);
        }
    }











    public static void main (String[] args)  {

        //highScoreList();

        DBConnection tryToRun = new DBConnection();

        //tryToRun.findPlayerHighScore("Angelo");
        //tryToRun.updatePlayerHighScore(tryToRun.currentSearchedPlayer[0],tryToRun.currentSearchedPlayer[1],tryToRun.currentSearchedPlayer[2]);
        //tryToRun.updatePlayerHighScore("Angelo", 25,26);

        tryToRun.findNBAPlayer("PPG");





        //highScoreList();

    }


    public String getCurrentNBAPlayerName() {
        return currentNBAPlayerName;
    }

    public void setCurrentNBAPlayerName(String currentNBAPlayerName) {
        this.currentNBAPlayerName = currentNBAPlayerName;
    }

    public Double getCurrentNBAPlayerAttribute() {
        return currentNBAPlayerAttribute;
    }

    public void setCurrentNBAPlayerAttribute(Double currentNBAPlayerAttribute) {
        this.currentNBAPlayerAttribute = currentNBAPlayerAttribute;
    }
}
