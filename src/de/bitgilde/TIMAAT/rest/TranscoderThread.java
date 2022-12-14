package de.bitgilde.TIMAAT.rest;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;

import de.bitgilde.TIMAAT.PropertyConstants;
import de.bitgilde.TIMAAT.TIMAATApp;

/*
 Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

/**
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Deprecated
public class TranscoderThread extends Thread {

	private int id;
	private String filename;

	public TranscoderThread(int id, String filename) {
		this.id = id;
		this.filename = filename;
	}

	public void run(){
		Process p;
		Process pFrames;

		File videoDir = new File(TIMAATApp.timaatProps.getProp(PropertyConstants.STORAGE_LOCATION)
			+ "medium/video/" + id);
		if ( !videoDir.exists() ) videoDir.mkdirs();
		File frameDir = new File(TIMAATApp.timaatProps.getProp(PropertyConstants.STORAGE_LOCATION)
			+ "medium/video/" + id + "/frames");
		if ( !frameDir.exists() ) frameDir.mkdirs();

		String[] commandLine = { TIMAATApp.timaatProps.getProp(PropertyConstants.FFMPEG_LOCATION)+"ffmpeg"+TIMAATApp.systemExt,
		"-i", filename, "-c:v", "libx264",
		"-crf", "23", // transcoded quality setting
		"-c:a", "aac", "-movflags", "faststart", "-movflags", "rtphint", "-y",
		TIMAATApp.timaatProps.getProp(PropertyConstants.STORAGE_LOCATION)
			+ "medium/video/" + id + "/" + id + "-video-transcoding.mp4" };
		ProcessBuilder pb = new ProcessBuilder(commandLine);
//		pb.inheritIO();

		String[] commandLineFrames = { TIMAATApp.timaatProps.getProp(PropertyConstants.FFMPEG_LOCATION)+"ffmpeg"+TIMAATApp.systemExt,
		"-i", filename, "-vf",
		"fps=1,scale=240:-1,pad=max(iw\\,ih)",
		TIMAATApp.timaatProps.getProp(PropertyConstants.STORAGE_LOCATION)
			+ "medium/video/" + id + "/frames/" + id + "-frame-%05d.jpg" };
		ProcessBuilder pbFrames = new ProcessBuilder(commandLineFrames);


		try {
			p = pb.start();
			BufferedReader is = new BufferedReader(new InputStreamReader(p.getErrorStream()));

			try {
				while ( p.isAlive() ) {
					sleep(500);
					String line = is.readLine();
					if ( line != null && line.startsWith("frame") ) System.out.println(id+": Transcoding "+line);
				}

			} catch (InterruptedException e) {
				System.err.println(e);  // "can't happen"
			}

			File transcodedVideo = new File(TIMAATApp.timaatProps.getProp(PropertyConstants.STORAGE_LOCATION)
				+ "medium/video/" + id + "/" + id + "-video-transcoding.mp4");

			if ( !transcodedVideo.exists() || !transcodedVideo.canRead() ) {
				// TODO handle transcoding error
			} else if ( transcodedVideo.length() == 0 ) {
				transcodedVideo.delete();
			} else transcodedVideo.renameTo(new File(TIMAATApp.timaatProps.getProp(PropertyConstants.STORAGE_LOCATION)
				+ "medium/video/" + id + "/" + id + "-video.mp4"));


		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}


		// TODO put in separate thread
		// create frame preview
		try {
			pFrames = pbFrames.start();
			BufferedReader is = new BufferedReader(new InputStreamReader(pFrames.getErrorStream()));

			try {
				while ( pFrames.isAlive() ) {
					sleep(500);
					String line = is.readLine();
					System.out.println(id+": "+line);
				}

			} catch (InterruptedException e) {
				System.err.println(e);  // "can't happen"
			}

		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
	}
}
