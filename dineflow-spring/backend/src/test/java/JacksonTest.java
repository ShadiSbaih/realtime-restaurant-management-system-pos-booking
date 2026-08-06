import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.json.JsonReadFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public class JacksonTest {
    public static void main(String[] args) throws Exception {
        String json = "{ \"test\": \"a\nb\" }";
        ObjectMapper mapper = new ObjectMapper()
            .configure(JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS.mappedFeature(), true);
        
        try {
            Map m = mapper.readValue(json, Map.class);
            System.out.println("Success mappedFeature: " + m);
        } catch(Exception e) {
            e.printStackTrace();
        }
        
        ObjectMapper mapper2 = com.fasterxml.jackson.databind.json.JsonMapper.builder()
            .enable(JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS)
            .build();
            
        try {
            Map m = mapper2.readValue(json, Map.class);
            System.out.println("Success JsonMapper builder: " + m);
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
