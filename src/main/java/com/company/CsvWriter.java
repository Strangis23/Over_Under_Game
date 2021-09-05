package com.company;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class CsvWriter {


    public CsvWriter() {

    }

    public void fileWriter(){


        try (FileWriter writer = new FileWriter(new File("Player"))){

            writer.append("Hello");

        } catch (IOException e) {
            e.printStackTrace();
        }

    }

}
